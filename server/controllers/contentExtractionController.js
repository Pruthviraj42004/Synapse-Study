const Resource = require('../models/Resource');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Use pdfreader for PDF extraction (lightweight, no canvas deps)
const { PdfReader } = require('pdfreader');

/**
 * @desc    Extract text content from a resource file (PDF/DOCX)
 * @route   GET /api/resources/:id/content
 * @access  Public
 */
const extractResourceContent = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the resource
        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }

        // Get file path
        const fileName = resource.fileUrl.split('/').pop();
        const filePath = path.join(__dirname, '../uploads', fileName);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found on server'
            });
        }

        let extractedText = '';
        const fileType = resource.fileType.toLowerCase();

        try {
            // Extract text based on file type
            if (fileType.includes('pdf')) {
                // Extract from PDF using pdfreader
                extractedText = await new Promise((resolve, reject) => {
                    const chunks = [];
                    new PdfReader().parseFileItems(filePath, (err, item) => {
                        if (err) {
                            reject(err);
                        } else if (!item) {
                            // End of file
                            resolve(chunks.join(' '));
                        } else if (item.text) {
                            chunks.push(item.text);
                        }
                    });
                });
            }
            else if (fileType.includes('wordprocessingml') || fileType.includes('msword') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                // Extract from DOCX
                const result = await mammoth.extractRawText({ path: filePath });
                extractedText = result.value;
            }
            else if (fileType.includes('text') || fileName.endsWith('.txt')) {
                // Extract from TXT
                extractedText = fs.readFileSync(filePath, 'utf-8');
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: `AI document analysis is currently supported for PDF, DOCX, and TXT files only.Your file type(${resource.fileType}) is not yet supported.You can still download and view the file normally.`
                });
            }

            // Clean up the text (remove excessive whitespace)
            extractedText = extractedText
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            // Limit text length to avoid overwhelming the AI (max 8000 chars for context)
            const maxLength = 8000;
            if (extractedText.length > maxLength) {
                extractedText = extractedText.substring(0, maxLength) + '\n\n[... Content truncated for length ...]';
            }

            res.json({
                success: true,
                content: extractedText,
                metadata: {
                    resourceId: resource._id,
                    title: resource.title,
                    subject: resource.subject,
                    description: resource.description,
                    fileType: resource.fileType,
                    fileName: resource.fileName,
                    extractedLength: extractedText.length
                }
            });

        } catch (extractError) {
            console.error('Text extraction error:', extractError);
            return res.status(500).json({
                success: false,
                error: 'Failed to extract text from file',
                details: extractError.message
            });
        }

    } catch (error) {
        console.error('Extract content error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to extract resource content',
            details: error.message
        });
    }
};

module.exports = {
    extractResourceContent
};

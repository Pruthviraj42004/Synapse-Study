/**
 * Seed sample resources for testing
 * Run with: node scripts/seedResources.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const sampleResources = [
    {
        title: "Data Structures Complete Notes - Unit 1 to 5",
        description: "Comprehensive notes covering all units of Data Structures including Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Hashing with examples and diagrams.",
        subject: "Data Structures",
        semester: 3,
        department: "Computer Science",
        type: "Notes",
        fileName: "ds-complete-notes.pdf",
        fileSize: 2457600, // 2.4 MB
        fileType: "application/pdf",
        tags: ["data-structures", "algorithms", "trees", "graphs", "semester-3"],
        status: "approved"
    },
    {
        title: "DBMS Previous Year Question Papers (2020-2024)",
        description: "Collection of previous year question papers for Database Management Systems with solutions and marking scheme.",
        subject: "Database Management Systems",
        semester: 4,
        department: "Computer Science",
        type: "QuestionPaper",
        fileName: "dbms-previous-papers.pdf",
        fileSize: 1843200, // 1.8 MB
        fileType: "application/pdf",
        tags: ["dbms", "sql", "question-papers", "exam-prep"],
        status: "approved"
    },
    {
        title: "Operating Systems Lab Manual - All Experiments",
        description: "Complete lab manual with code and output for all OS lab experiments including process scheduling, memory management, and file systems.",
        subject: "Operating Systems",
        semester: 5,
        department: "Computer Science",
        type: "Lab",
        fileName: "os-lab-manual.pdf",
        fileSize: 3145728, // 3 MB
        fileType: "application/pdf",
        tags: ["operating-systems", "lab", "c-programming", "unix"],
        status: "approved"
    },
    {
        title: "Web Development Presentation - MERN Stack",
        description: "PowerPoint presentation covering MERN stack basics, project structure, and deployment strategies.",
        subject: "Web Technologies",
        semester: 6,
        department: "Computer Science",
        type: "PPT",
        fileName: "mern-stack-ppt.pptx",
        fileSize: 5242880, // 5 MB
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        tags: ["web-development", "mern", "react", "nodejs", "mongodb"],
        status: "approved"
    },
    {
        title: "Machine Learning Reference Book - Pattern Recognition",
        description: "Comprehensive reference material for ML algorithms, pattern recognition techniques, and practical applications.",
        subject: "Machine Learning",
        semester: 7,
        department: "Computer Science",
        type: "Reference",
        fileName: "ml-pattern-recognition.pdf",
        fileSize: 8388608, // 8 MB
        fileType: "application/pdf",
        tags: ["machine-learning", "ai", "pattern-recognition", "algorithms"],
        status: "approved"
    }
];

async function seedResources() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a user to be the uploader
        let uploader = await User.findOne();

        if (!uploader) {
            console.log('⚠️  No users found. Please create a user first or run the newsletter seeder.');
            process.exit(1);
        }

        console.log(`📝 Using uploader: ${uploader.email}`);

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📁 Created uploads directory');
        }

        // Delete existing sample resources
        await Resource.deleteMany({
            title: {
                $in: sampleResources.map(r => r.title)
            }
        });
        console.log('🗑️  Cleared existing sample resources');

        // Create placeholder files and resources
        const resources = [];
        for (const resourceData of sampleResources) {
            // Create a placeholder text file
            const filePath = path.join(uploadsDir, resourceData.fileName);
            const fileContent = `This is a sample ${resourceData.type} file for: ${resourceData.title}\n\n${resourceData.description}\n\nThis is a placeholder file for testing purposes.`;
            fs.writeFileSync(filePath, fileContent);

            // Create resource in database
            const resource = await Resource.create({
                ...resourceData,
                fileUrl: `/uploads/${resourceData.fileName}`,
                uploader: uploader._id,
                views: Math.floor(Math.random() * 50),
                downloads: Math.floor(Math.random() * 30)
            });

            resources.push(resource);
            console.log(`   ✅ Created: ${resource.title}`);
        }

        console.log(`\n🎉 Successfully created ${resources.length} sample resources!`);
        console.log('\n📱 You can now view these resources in your app at /resources');
        console.log('💡 Note: These are placeholder files for testing. Real file upload works when you upload actual files.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding resources:', error);
        process.exit(1);
    }
}

// Run the seeder
seedResources();

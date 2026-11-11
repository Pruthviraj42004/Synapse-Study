/**
 * Seed sample newsletters for testing
 * Run with: node scripts/seedNewsletters.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');

const sampleNewsletters = [
    {
        title: "Welcome to New Academic Year 2024-25",
        description: "Important information for all students regarding the new academic year, fee structure, and semester schedule.",
        content: `Dear Students,

Welcome to the Academic Year 2024-25! We are excited to have you all back on campus.

**Important Dates:**
- Classes Begin: January 15, 2025
- Mid-term Exams: March 10-15, 2025
- End-term Exams: May 15-25, 2025

**Fee Payment:**
Please complete your fee payment by January 10, 2025 to avoid late fees.

**Campus Facilities:**
- Library: Open 8 AM - 10 PM
- Computer Labs: Open 9 AM - 8 PM
- Canteen: Open 8 AM - 8 PM

For any queries, please contact the administration office.

Best regards,
College Administration`,
        type: "Newsletter",
        category: "Academic",
        status: "published",
        isPinned: true
    },
    {
        title: "Campus Placement Drive - Tech Giants",
        description: "Exciting placement opportunities with top tech companies. Register now!",
        content: `🎯 **Campus Placement Drive Alert!**

We are thrilled to announce on-campus recruitment by leading tech companies:

**Companies Visiting:**
- Google (SDE roles)
- Microsoft (Software Engineer)
- Amazon (SDE-1)
- Flipkart (Backend Developer)
- TCS (Digital roles)

**Eligibility:**
- Final Year Students (B.Tech/M.Tech)
- Minimum CGPA: 7.0
- No active backlogs

**Registration Deadline:** January 20, 2025

**Preparation Tips:**
1. Practice DSA on LeetCode/CodeForces
2. Revise core CS subjects
3. Update your resume
4. Attend mock interview sessions

Register through the placement portal: placement.college.edu

Good luck to all candidates!

Placement Cell`,
        type: "Announcement",
        category: "Placement",
        status: "published",
        isPinned: true
    },
    {
        title: "Tech Fest 2025 - Innovation Unleashed",
        description: "Annual technical festival featuring hackathons, workshops, and tech talks.",
        content: `🚀 **Tech Fest 2025 is Here!**

Get ready for the biggest technical extravaganza of the year!

**Event Highlights:**
- 24-hour Hackathon (Prize pool: ₹2 Lakhs)
- AI/ML Workshop by industry experts
- Coding competitions
- Project exhibitions
- Guest lectures from Google, Microsoft engineers

**Dates:** February 10-12, 2025

**Registration:** FREE for all students
Register at: techfest2025.college.edu

**Hackathon Themes:**
1. AI for Social Good
2 Sustainable Tech Solutions
3. FinTech Innovation
4. Healthcare Technology

**Prizes:**
- 1st Prize: ₹1,00,000
- 2nd Prize: ₹50,000
- 3rd Prize: ₹25,000
- Best Innovation Award: ₹25,000

Don't miss this opportunity to showcase your skills!

Technical Club`,
        type: "Announcement",
        category: "Event",
        status: "published"
    },
    {
        title: "Hostel Room Allocation - Spring Semester",
        description: "Hostel room allocation process and guidelines for the upcoming semester.",
        content: `📢 **Hostel Room Allocation Notice**

**For New Students:**
Online room preferences will open on January 5, 2025.

**For Existing Students:**
Room retention/change requests can be submitted until January 8, 2025.

**Hostel Facilities:**
- WiFi in all rooms
- 24/7 security
- Mess facilities with varied menu
- Study rooms on each floor
- Gym and recreation area

**Important Guidelines:**
1. Maintain cleanliness
2. No unauthorized guests after 10 PM
3. Report maintenance issues promptly
4. Follow mess timings strictly

**Mess Timings:**
- Breakfast: 7:30 AM - 9:30 AM
- Lunch: 12:00 PM - 2:00 PM
- Dinner: 7:00 PM - 9:00 PM

For queries, contact hostel office: hostel@college.edu

Hostel Administration`,
        type: "Newsletter",
        category: "General",
        status: "published"
    },
    {
        title: "Library New Books Arrival - January 2025",
        description: "Latest collection of technical and non-technical books now available in the library.",
        content: `📚 **New Books in Library!**

The library has acquired 500+ new books across various domains.

**Technical Books:**
- "System Design Interview" by Alex Xu
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Deep Learning" by Ian Goodfellow
- "Clean Code" by Robert Martin
- "Introduction to Algorithms" by CLRS

**Programming Languages:**
- Python, Java, C++, JavaScript latest editions
- Web Development frameworks
- Mobile App Development

**Competitive Programming:**
- "Competitive Programmer's Handbook"
- "Guide to Competitive Programming"

**Non-Technical:**
- Latest fiction bestsellers
- Self-help and motivation
- Biographies

**How to Issue:**
1. Search book in library portal
2. Reserve online
3. Collect from library counter within 2 days

**Borrowing Limits:**
- Students: 3 books for 15 days
- Faculty: books for 30 days

Visit library or browse online catalog: library.college.edu

Happy Reading!
Library Team`,
        type: "Announcement",
        category: "General",
        status: "published"
    },
    {
        title: "Summer Internship  Opportunities 2025",
        description: "Apply for summer internships with leading companies and startups.",
        content: `🌟 **Summer Internship Season is Open!**

**Available Opportunities:**

**Software Development:**
- Microsoft - SDE Intern
- Google - STEP Intern
- Amazon - SDE Intern
- Flipkart - Software Engineer Intern

**Data Science & ML:**
- Samsung - ML Intern
- Walmart Labs - Data Analyst Intern
- Oracle - AI/ML Intern

**Product Management:**
- Razorpay - Product Intern
- Swiggy - Product Management Intern

**Startups:**
- Multiple funded startups hiring across roles

**Duration:** May - July 2025 (8-12 weeks)

**Stipend Range:** ₹25,000 - ₹80,000 per month

**Eligibility:**
- Pre-final year students (2nd/3rd year)
- Good academic record
- Relevant technical skills

**Application Process:**
1. Visit career portal
2. Upload resume
3. Complete online assessment
4. Interview rounds

**Application Deadline:** January 30, 2025

Apply now: internships.college.edu

Career Development Cell`,
        type: "Announcement",
        category: "Placement",
        status: "published"
    }
];

async function seedNewsletters() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find an admin user (or create one if doesn't exist)
        let adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.log('⚠️  No admin user found. Creating default admin user...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);

            adminUser = await User.create({
                name: 'Admin',
                email: 'admin@college.edu',
                password: hashedPassword,
                college: 'College Administration',
                role: 'admin'
            });
            console.log('✅ Admin user created: admin@college.edu / Admin@123');
        }

        console.log(`📝 Using admin user: ${adminUser.email}`);

        // Delete existing sample newsletters
        await Newsletter.deleteMany({
            title: {
                $in: sampleNewsletters.map(n => n.title)
            }
        });
        console.log('🗑️  Cleared existing sample newsletters');

        // Create newsletters
        const newsletters = await Newsletter.insertMany(
            sampleNewsletters.map(newsletter => ({
                ...newsletter,
                author: adminUser._id,
                publishedAt: new Date()
            }))
        );

        console.log(`✅ Successfully created ${newsletters.length} sample newsletters:`);
        newsletters.forEach((n, i) => {
            console.log(`   ${i + 1}. ${n.title} [${n.category}]`);
        });

        console.log('\n🎉 Newsletter seeding completed successfully!');
        console.log('\n📱 You can now view these newsletters in your app at /newsletters');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding newsletters:', error);
        process.exit(1);
    }
}

// Run the seeder
seedNewsletters();

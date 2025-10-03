# UIU Section Selector

A modern, fully responsive web application designed for UIU students to plan their class schedules efficiently with intelligent conflict detection and multiple export options.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

### 📋 Plan Management
- **Multiple Section Plans**: Create and manage multiple section plans simultaneously (e.g., "Plan A", "Plan B", "Plan C")
- **Plan Switching**: Easily switch between different plans to compare schedules
- **Isolated Conflicts**: Each plan has independent conflict detection - conflicts only matter within the same plan

### 🔍 Smart Conflict Detection
- **Real-time Conflict Detection**: Automatically detects time conflicts when adding courses to a plan
- **Visual Indicators**: Courses with conflicts are highlighted with red borders and warning messages
- **Plan-Specific Navigation**: Click "View Conflicts" to automatically navigate to the conflicting plan and scroll to the conflicting course
- **Intelligent Highlighting**: Conflicting courses are highlighted with a yellow background for 3 seconds after navigation

### 📊 Course Management
- **PDF Import**: Import class routines directly from UIU's PDF format
- **Manual Course Entry**: Add courses manually with section, faculty, days, time, and room information
- **Section Cards**: View all available sections for each course with detailed information
- **Easy Selection**: Add any section to your preferred plan with a single click

### 🤖 AI Schedule Planner
- **Faculty Preferences**: Prioritize specific faculty members for your courses
- **Day/Time Constraints**: Set preferences for specific days or time slots
- **Automatic Generation**: Generate optimized schedules based on your preferences
- **Conflict-Free**: Generated schedules automatically avoid time conflicts
- **Multiple Options**: Generate multiple schedule variations to choose from

### 📤 Export Options
Export your finalized schedule in multiple formats:
- **PDF**: Professional PDF document with complete schedule details
- **PNG**: High-quality image for easy sharing
- **Excel**: Spreadsheet format with detailed course information
- **iCalendar (.ics)**: Import directly into Google Calendar, Outlook, or Apple Calendar

### 🎨 User Interface
- **Fully Responsive**: Optimized for mobile phones, tablets, and desktop screens
- **Dark/Light Theme**: Toggle between dark and light modes based on your preference
- **Modern Design**: Clean, intuitive interface built with shadcn/ui components
- **Mobile-Optimized Tables**: Horizontal scrolling for tables on smaller screens
- **Compact Layouts**: Space-efficient designs for mobile devices

### 📱 Mobile Features
- **Responsive Tables**: Horizontal scrollable tables maintain full functionality on phones
- **Adaptive Layouts**: Schedule cards automatically adjust for mobile (2-row) and desktop (1-row) layouts
- **Touch-Friendly**: Large touch targets for buttons and interactive elements
- **Compact Stats**: Inline stat display optimized for small screens

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TahsinFaiyaz30/UIU-Section-Selector.git
cd UIU-Section-Selector
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.3.4** - React framework with App Router and Turbopack
- **React 19.0.0** - UI library
- **TypeScript 5.x** - Type safety

### Styling
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark/Light theme switching

### Forms & Validation
- **React Hook Form** - Performant form handling
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolver for React Hook Form

### Export Functionality
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion for images
- **xlsx** - Excel file generation
- **ics** - iCalendar file generation
- **pdf2json** - PDF parsing for course data import

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast development bundler (Next.js 15)
- **PostCSS** - CSS transformations

## 📖 Usage Guide

### Creating Section Plans

1. **Add a Course Manually**:
   - Enter course code, section, faculty, days, time, and room
   - Select which plan to add the course to
   - Click "Add Course"

2. **Import from PDF**:
   - Upload UIU's class routine PDF
   - The app automatically parses and displays available sections

3. **Select Sections**:
   - Browse available sections in the course cards
   - Click "Add to [Plan Name]" to add a section to your plan
   - Conflicts are detected automatically

### Managing Conflicts

- **View Conflicts**: If a course has conflicts, click the "View Conflicts" link
- **Navigation**: Automatically switches to the conflicting plan and highlights the conflicting course
- **Resolution**: Remove or modify conflicting courses to resolve conflicts

### Using the Schedule Planner

1. **Set Preferences**:
   - Add preferred faculty members
   - Specify preferred days or time slots

2. **Generate Schedule**:
   - Click "Generate Schedule"
   - Review generated conflict-free schedules
   - Add the generated schedule to a section plan

3. **Refine**:
   - Adjust preferences and regenerate if needed
   - Compare multiple generated options

### Exporting Your Schedule

1. Select your finalized section plan
2. Click the export button and choose your format:
   - **PDF**: Best for printing or saving
   - **PNG**: Best for sharing on social media
   - **Excel**: Best for editing or data analysis
   - **Calendar**: Best for importing into calendar apps

## 🎯 Key Features Explained

### Plan-Specific Conflict Detection
Unlike other schedulers, conflicts only matter **within the same plan**. You can:
- Have the same course at the same time in different plans
- Compare completely different schedule arrangements
- Work on multiple "what-if" scenarios simultaneously

### Smart Navigation
When you click "View Conflicts":
1. Automatically switches to the plan containing the conflict
2. Scrolls the table to show the conflicting course
3. Highlights the conflicting course with a yellow background
4. Removes highlight after 3 seconds for clarity

### Responsive Design Philosophy
- **Mobile First**: Designed for phones, enhanced for larger screens
- **No Feature Loss**: All features available on all screen sizes
- **Adaptive Layouts**: UI elements rearrange for optimal viewing
- **Touch Optimized**: Large buttons and touch targets on mobile

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📦 Repository

This project is available on GitHub: [UIU Section Selector](https://github.com/TahsinFaiyaz30/UIU-Section-Selector)

## 🚢 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Built with ❤️ for UIU Students**

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CourseCardSelector from "@/components/course-card-selector";
import SchedulePlanner from "@/components/schedule-planner";

interface Course {
  program: string;
  courseCode: string;
  title: string;
  section: string;
  room1: string;
  room2: string;
  day1: string;
  day2: string;
  time1: string;
  time2: string;
  facultyName: string;
  facultyInitial: string;
  credit: string;
}

const parsePdfText = (text: string): Course[] => {
  console.log("Starting to parse PDF text...");
  const courses: Course[] = [];
  
  const cleanedText = text.replace(/(\d{1,2}:\d{2}:[AP]M)\s-\s(\d{1,2}:\d{2}:[AP]M)/g, '$1-$2');
  
  const headerEndMarker = "Credit";
  const startIndex = cleanedText.indexOf(headerEndMarker);
  if (startIndex === -1) {
    console.error("Could not find the header in the PDF text.");
    toast.error("Parsing Error: Could not find the data table header in the PDF. The PDF format might be unsupported.");
    return [];
  }
  const courseDataText = cleanedText.substring(startIndex + headerEndMarker.length).trim();

  const courseBlocks = courseDataText.split(/(?=\d+\s+(?:BSCSE|BSDS))/).filter(block => block.trim() !== "");

  console.log(`Found ${courseBlocks.length} potential course blocks.`);

  courseBlocks.forEach((block) => {
    try {
      // Remove any trailing header/footer junk that might appear after a course block
      const junkKeywords = ['CLASS ROUTINE', 'United International University', 'Course Offerings'];
      let cleanText = block;
      junkKeywords.forEach((kw) => {
        const idx = cleanText.indexOf(kw);
        if (idx !== -1) {
          cleanText = cleanText.substring(0, idx).trim();
        }
      });
      let remainingBlock = cleanText.trim();

      // 1. Extract SL, Program, and Course Code from the start
      // Allow course codes with an optional trailing uppercase letter (e.g., CSE 2218A)
      const initialMatch = remainingBlock.match(/^(\d+)\s+(BSCSE|BSDS)\s+([A-Z]{2,4}\s+\d{4}[A-Z]?)/);
      if (!initialMatch) {
        console.warn(`Skipping block with unexpected start: ${block}`);
        return;
      }
      const program = initialMatch[2];
      const courseCode = initialMatch[3];
      remainingBlock = remainingBlock.substring(initialMatch[0].length).trim();

      // 4. Extract Faculty Name, Initial, and Credit by finding the last occurrence in the block
      // Extract faculty info by scanning for the last pattern of "Name Initial Credit"
      let facultyName = "TBA";
      let facultyInitial = "TBA";
      let credit = "0";
      const facultyPattern = /([A-Za-z.\s]+?)\s*([A-Za-z]{1,5}|TBA)\s*(\d)\b/g;
      let match: RegExpExecArray | null = null;
      let lastMatch: RegExpExecArray | null = null;
      while ((match = facultyPattern.exec(remainingBlock)) !== null) {
        lastMatch = match;
      }
      if (lastMatch) {
        facultyName = lastMatch[1].trim();
        facultyInitial = lastMatch[2];
        credit = lastMatch[3];
        remainingBlock = remainingBlock.substring(0, lastMatch.index).trim();
      } else {
        // If faculty info missing, still extract credit at end
        const creditOnlyMatch = remainingBlock.match(/(\d)\s*$/);
        if (creditOnlyMatch) {
          credit = creditOnlyMatch[1];
          // Remove credit from remainingBlock
          remainingBlock = remainingBlock.substring(0, creditOnlyMatch.index).trim();
        }
      }
      // Remove stray AM/PM tokens that belong to time, not name
      facultyName = facultyName.replace(/\b(AM|PM)\b/g, '').trim();

      // 5. Extract Times (one or two exact as in PDF)
      const timeRegex = /\d{1,2}:\d{2}:[AP]M-\d{1,2}:\d{2}:[AP]M/g;
      const rawTimeMatches = remainingBlock.match(timeRegex) || [];
      const times = rawTimeMatches.map(t => t.replace(/-/g, ' - '));
      const time1 = times[0] || '';
      const time2 = times[1] || '';
      if (rawTimeMatches.length > 0 && rawTimeMatches[0]) {
        const firstTime = rawTimeMatches[0];
        const idx = remainingBlock.indexOf(firstTime);
        if (idx !== -1) {
          remainingBlock = remainingBlock.substring(0, idx).trim();
        }
      }

      // 6. Extract Days (one or two exact as in PDF)
      const dayRegex = /Sat|Sun|Mon|Tue|Wed|Thu|Fri/g;
      const rawDayMatches = remainingBlock.match(dayRegex) || [];
      const day1 = rawDayMatches[0] || '';
      const day2 = rawDayMatches[1] || '';
      if (rawDayMatches.length > 0 && rawDayMatches[0]) {
        const firstDay = rawDayMatches[0];
        const idx = remainingBlock.indexOf(firstDay);
        if (idx !== -1) {
          remainingBlock = remainingBlock.substring(0, idx).trim();
        }
      }

      // 7. Extract Rooms (can be one or two, or none)
      const roomRegex = /\d{3}/g;
      const roomMatches = remainingBlock.match(roomRegex) || [];
      const room1 = roomMatches[0] || "TBA";
      const room2 = roomMatches[1] || (room1 === "TBA" ? "TBA" : room1);
      if (roomMatches.length > 0 && roomMatches[0]) {
        const firstRoomIndex = remainingBlock.indexOf(roomMatches[0]);
        if (firstRoomIndex !== -1) {
          remainingBlock = remainingBlock.substring(0, firstRoomIndex).trim();
        }
      }

      // 8. Extract Section
      const sectionMatch = remainingBlock.match(/([A-Z]{1,2})(?:\s*\(If\s+Required\))?$/i);
      let section = "TBA";
      if (sectionMatch) {
        section = sectionMatch[1];
        remainingBlock = remainingBlock.substring(0, sectionMatch.index).trim();
      }

      // 9. Whatever is left is the Title
      const title = remainingBlock.trim();

      const course: Course = {
        program,
        courseCode,
        title,
        section,
        room1,
        room2,
        day1,
        day2,
        time1,
        time2,
        facultyName,
        facultyInitial,
        credit,
      };

      courses.push(course);
    } catch (e) {
      console.error(`Failed to parse block: "${block}"`, e);
    }
  });

  if (courses.length === 0 && courseBlocks.length > 0) {
      toast.error("Parsing Failed: Could not extract any course data, though blocks were found. The PDF structure might have changed.");
  }

  console.log("Finished parsing PDF text. Found courses:", courses.length);
  return courses;
};

const UploadView = ({ onPdfProcessed }: { onPdfProcessed: (courses: Course[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    toast.info("Uploading and processing PDF...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred during upload.");
      }

      const data = await response.json();
      if (data.text) {
        const parsedCourses = parsePdfText(data.text);
        onPdfProcessed(parsedCourses);
      } else {
        throw new Error("The PDF could not be read or is empty.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      onPdfProcessed([]); // Send empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreUploadedLoad = async () => {
    setIsLoading(true);
    toast.info("Loading pre-uploaded course data...");
    try {
      const response = await fetch("/api/demo-pdf", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load pre-uploaded data.");
      }

      const data = await response.json();
      if (data.text) {
        const parsedCourses = parsePdfText(data.text);
        onPdfProcessed(parsedCourses);
      } else {
        throw new Error("The pre-uploaded PDF could not be read or is empty.");
      }
    } catch (error) {
      console.error("Error loading pre-uploaded PDF:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred while loading pre-uploaded data.");
      }
      onPdfProcessed([]); // Send empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleFileChange(file);
    } else {
      toast.error("Please drop a PDF file.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Processing PDF...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <Card 
        className={`w-full max-w-lg border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-muted/50' : 'border-border'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Course Data</CardTitle>
          <CardDescription>Use pre-uploaded course data or upload your own PDF file</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-6">
          <div className="space-y-6">
            {/* Pre-uploaded Section */}
            <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">📄</span>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">Use Pre-uploaded PDF</h3>
              </div>
              <Button 
                size="lg"
                onClick={handlePreUploadedLoad}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start with Pre-uploaded Data
              </Button>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Using CLASS-ROUTINE-252.pdf - No upload required
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">Or</span>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">📁</span>
                <h3 className="font-semibold text-green-700 dark:text-green-300">Upload Your Own PDF</h3>
              </div>
              <div>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} 
                  accept=".pdf"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200">
                    <span>Select Your PDF File</span>
                  </Button>
                </label>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Drag and drop or click to browse your files
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DataView = ({ courses: initialCourses, onBack }: { courses: Course[], onBack: () => void }) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(initialCourses);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'planner'>('card');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawTerm = event.target.value;
    setSearchTerm(rawTerm);
    const term = rawTerm.toLowerCase();
    const stopWords = ['and', 'of', 'the', 'for', 'if', 'required', 'a', 'an', 'in', 'on', 'to'];
    const filtered = initialCourses.filter((course) => {
      const titleLower = course.title.toLowerCase();
      const codeLower = course.courseCode.toLowerCase();
      const facultyLower = course.facultyName.toLowerCase();
      const sectionLower = course.section.toLowerCase();
      const initialLower = course.facultyInitial.toLowerCase();
      // Acronym from title, skipping common stop words
      const acronym = course.title
        .split(/\s+/)
        .filter((w) => !stopWords.includes(w.toLowerCase()))
        .map((w) => w[0])
        .join('')
        .toLowerCase();

      return (
        titleLower.includes(term) ||
        codeLower.includes(term) ||
        facultyLower.includes(term) ||
        initialLower.includes(term) ||
        acronym.includes(term) ||
        sectionLower.includes(term)
      );
    });
    setFilteredCourses(filtered);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourses(prev => {
        const isSelected = prev.some(c => c.courseCode === course.courseCode && c.section === course.section);
        if (isSelected) {
            return prev.filter(c => !(c.courseCode === course.courseCode && c.section === course.section));
        } else {
            return [...prev, course];
        }
    });
  };

  const handleClearAllSelected = () => {
    setSelectedCourses([]);
  };

  const isCourseSelected = (course: Course) => {
    return selectedCourses.some(c => c.courseCode === course.courseCode && c.section === course.section);
  }

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={onBack}>Back to Upload</Button>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'card' ? 'default' : 'outline'}
            onClick={() => setViewMode('card')}
          >
            Card Selector
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Bulk Selector
          </Button>
          <Button 
            variant={viewMode === 'planner' ? 'default' : 'outline'}
            onClick={() => setViewMode('planner')}
          >
            Schedule Planner
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {/* Only show Selected Sections card for card and table modes */}
        {viewMode !== 'planner' && (
          <div className="w-full">
              <Card>
                  <CardHeader>
                      <CardTitle>Selected Sections</CardTitle>
                      <CardDescription>These are the sections you have chosen.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {selectedCourses.length === 0 ? (
                          <p>No sections selected.</p>
                      ) : (
                          <div className="overflow-auto max-h-[40vh] w-full border rounded-md">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Course Code</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Course Name</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Section</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Faculty</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Credit</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Days</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Time</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Room</th>
                                  <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedCourses.map((course, index) => (
                                  <tr
                                    key={`${course.courseCode}-${course.section}-${index}-selected`}
                                    className="border-b hover:bg-muted/50"
                                  >
                                    <td className="px-2 py-1 break-words text-sm">{course.courseCode}</td>
                                    <td className="px-2 py-1 break-words text-sm">{course.title}</td>
                                    <td className="px-2 py-1 break-words text-sm">{course.section}</td>
                                    <td className="px-2 py-1 break-words text-sm">
                                      {course.facultyName === "TBA"
                                        ? "TBA"
                                        : `${course.facultyName} (${course.facultyInitial})`}
                                    </td>
                                    <td className="px-2 py-1 break-words text-sm">{course.credit}</td>
                                    <td className="px-2 py-1 break-words text-sm">
                                      {course.day1}{course.day2 ? ` - ${course.day2}` : ''}
                                    </td>
                                    <td className="px-2 py-1 break-words text-sm">
                                      {course.time1}
                                      {course.time2 && course.time2 !== course.time1 && (
                                        <div>{course.time2}</div>
                                      )}
                                    </td>
                                    <td className="px-2 py-1 break-words text-sm">
                                      {course.room1}{course.room2 && course.room2 !== course.room1 ? ` - ${course.room2}` : ''}
                                    </td>
                                    <td className="px-2 py-1">
                                      <Button size="sm" variant="outline" onClick={() => handleSelectCourse(course)}>
                                        Remove
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'planner' ? (
          <SchedulePlanner courses={initialCourses} />
        ) : viewMode === 'card' ? (
          <CourseCardSelector 
            courses={initialCourses} 
            selectedCourses={selectedCourses}
            onCourseSelect={handleSelectCourse}
            onClearAllSelected={handleClearAllSelected}
          />
        ) : (
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Available Courses</CardTitle>
                <CardDescription>
                  Found {initialCourses.length} course entries. Click on a row to select a course section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search by course, title, faculty, or section"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="mb-4"
                />
                <div className="overflow-auto max-h-[60vh] w-full border rounded-md">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Code</th>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Title</th>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Sec</th>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Faculty</th>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Credit</th>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Schedule</th>
                        <th className="sticky top-0 bg-white dark:bg-gray-950 z-20 border-b px-2 py-3 text-left font-medium text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course, index) => (
                        <tr
                          key={`${course.courseCode}-${course.section}-${index}`}
                          className={`border-b hover:bg-muted/50 ${isCourseSelected(course) ? 'bg-muted' : ''}`}
                        >
                          <td className="px-2 py-1 break-words text-sm">{course.courseCode}</td>
                          <td className="px-2 py-1 break-words text-sm">{course.title}</td>
                          <td className="px-2 py-1 break-words text-sm">{course.section}</td>
                          <td className="px-2 py-1 break-words text-sm">
                            {course.facultyName === "TBA"
                              ? "TBA"
                              : `${course.facultyName} (${course.facultyInitial})`}
                          </td>
                          <td className="px-2 py-1 break-words text-sm">{course.credit}</td>
                          <td className="px-2 py-1 text-sm">
                            <div>Day(s): {course.day1}{course.day2 ? ` - ${course.day2}` : ''}</div>
                            {course.time1 && (<div>Time: {course.time1}</div>)}
                            {course.room1 && (<div>Room: {course.room1}</div>)}
                          </td>
                          <td className="px-2 py-1">
                            <Button size="sm" variant="outline" onClick={() => handleSelectCourse(course)}>
                              {isCourseSelected(course) ? 'Remove' : 'Add'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};


export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<'upload' | 'data'>('upload');

  const handlePdfProcessed = (parsedCourses: Course[]) => {
    if (parsedCourses.length > 0) {
      setCourses(parsedCourses);
      setView('data');
      toast.success(`Successfully parsed ${parsedCourses.length} courses.`);
    } else {
      // Error toast is handled in UploadView
      setView('upload');
    }
  };

  const handleBack = () => {
    setView('upload');
    setCourses([]);
  }

  if (view === 'upload') {
    return <UploadView onPdfProcessed={handlePdfProcessed} />;
  }

  return <DataView courses={courses} onBack={handleBack} />;
}

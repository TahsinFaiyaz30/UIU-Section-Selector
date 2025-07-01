"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface CourseCardData {
  id: string;
  selectedCourse: string;
  selectedFaculty: string;
  selectedDay: string;
  selectedTime: string;
  finalSection?: Course;
}

interface CourseCardSelectorProps {
  courses: Course[];
  selectedCourses: Course[];
  onCourseSelect: (course: Course) => void;
  onClearAllSelected: () => void;
}

const CourseCard = ({
  cardData,
  courses,
  program,
  selectedCourses,
  onUpdate,
  onDelete,
  onAddSection,
  onRemoveSection,
  checkConflict,
}: {
  cardData: CourseCardData;
  courses: Course[];
  program: string;
  selectedCourses: Course[];
  onUpdate: (id: string, updates: Partial<CourseCardData>) => void;
  onDelete: (id: string) => void;
  onAddSection: (course: Course) => void;
  onRemoveSection: (course: Course) => void;
  checkConflict: (newCourse: Course) => Course[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [isCourseFocused, setIsCourseFocused] = useState(false);
  const [isFacultyFocused, setIsFacultyFocused] = useState(false);

  // Filter courses by program
  const programCourses = courses.filter(course => course.program === program);

  // Get unique courses for search
  const uniqueCourses = Array.from(
    new Map(
      programCourses.map(course => [
        `${course.courseCode}-${course.title}`,
        { courseCode: course.courseCode, title: course.title }
      ])
    ).values()
  );

  // Filter courses by search term with enhanced matching
  const filteredCourses = uniqueCourses.filter(course => {
    const searchLower = searchTerm.toLowerCase().trim();
    const titleLower = course.title.toLowerCase();
    const codeLower = course.courseCode.toLowerCase();
    
    // Basic matching - most important, check first
    if (titleLower.includes(searchLower) || codeLower.includes(searchLower)) {
      return true;
    }
    
    // Dynamic uppercase letter extraction - extract all capital letters from title
    const upperCaseLetters = course.title.match(/[A-Z]/g);
    if (upperCaseLetters && upperCaseLetters.length >= 2) {
      const acronymFromUppercase = upperCaseLetters.join('').toLowerCase();
      
      // Exact match with full uppercase acronym
      if (acronymFromUppercase === searchLower) {
        return true;
      }
      
      // Check if search term matches start of uppercase acronym
      if (searchLower.length >= 2 && acronymFromUppercase.startsWith(searchLower)) {
        return true;
      }
      
      // Check if search term is contained within uppercase acronym
      if (searchLower.length >= 2 && acronymFromUppercase.includes(searchLower)) {
        return true;
      }
      
      // Check partial uppercase acronyms (first N letters)
      for (let i = 2; i <= Math.min(upperCaseLetters.length, searchLower.length + 1); i++) {
        const partialUppercaseAcronym = upperCaseLetters.slice(0, i).join('').toLowerCase();
        if (partialUppercaseAcronym === searchLower) {
          return true;
        }
      }
    }
    
    // Dynamic acronym from first letters of significant words
    const stopWords = ['and', 'of', 'the', 'for', 'in', 'on', 'to', 'a', 'an', 'with', 'by', 'from', 'at', 'as', 'is', 'are', 'was', 'were', 'i', 'ii', 'iii', 'iv', 'v', 'using', 'lab', 'laboratory', 'introduction', 'basic', 'advanced', 'theory', 'practical'];
    const titleWords = course.title.split(/\s+/).filter(word => 
      word.length > 1 && !stopWords.includes(word.toLowerCase())
    );
    
    if (titleWords.length >= 2) {
      // Full acronym from first letters of all significant words
      const firstLetterAcronym = titleWords.map(word => word[0]).join('').toLowerCase();
      
      // Exact match with full first-letter acronym
      if (firstLetterAcronym === searchLower) {
        return true;
      }
      
      // Check if search matches start of first-letter acronym
      if (searchLower.length >= 2 && firstLetterAcronym.startsWith(searchLower)) {
        return true;
      }
      
      // Check if search is contained in first-letter acronym
      if (searchLower.length >= 2 && firstLetterAcronym.includes(searchLower)) {
        return true;
      }
      
      // Dynamic partial acronyms - check all possible combinations
      for (let i = 2; i <= Math.min(titleWords.length, searchLower.length + 2); i++) {
        const partialAcronym = titleWords.slice(0, i).map(word => word[0]).join('').toLowerCase();
        if (partialAcronym === searchLower) {
          return true;
        }
      }
      
      // Check sliding window acronyms (e.g., for "DS" in "Data Structures and Algorithms")
      for (let start = 0; start <= titleWords.length - 2; start++) {
        for (let length = 2; length <= Math.min(4, titleWords.length - start); length++) {
          const slidingAcronym = titleWords.slice(start, start + length)
            .map(word => word[0]).join('').toLowerCase();
          if (slidingAcronym === searchLower) {
            return true;
          }
        }
      }
    }
    
    // Check for word-level matches (partial word matching)
    if (titleWords.length > 0) {
      // Check if search term matches the start of any significant word
      const matchesWordStart = titleWords.some(word => 
        word.toLowerCase().startsWith(searchLower) && searchLower.length >= 2
      );
      if (matchesWordStart) {
        return true;
      }
    }
    
    // Check common course number patterns (Roman numerals)
    const romanToNumber: { [key: string]: string } = {
      'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5', 'vi': '6'
    };
    
    for (const [roman, number] of Object.entries(romanToNumber)) {
      if ((titleLower.includes(roman) && searchLower === number) ||
          (titleLower.includes(number) && searchLower === roman)) {
        return true;
      }
    }
    
    // Match individual words in title (for multi-word searches)
    if (searchLower.includes(' ')) {
      const searchWords = searchLower.split(/\s+/).filter(word => word.length > 1);
      if (searchWords.every(searchWord => 
        titleWords.some(titleWord => titleWord.toLowerCase().includes(searchWord))
      )) {
        return true;
      }
    }
    
    return false;
  });

  // Get available faculties for selected course
  const availableFaculties = cardData.selectedCourse
    ? Array.from(
        new Set(
          programCourses
            .filter(course => `${course.courseCode} - ${course.title}` === cardData.selectedCourse)
            .map(course => `${course.facultyName} (${course.facultyInitial})`)
        )
      )
    : [];

  // Filter faculties by search term
  const filteredFaculties = availableFaculties.filter(faculty =>
    faculty.toLowerCase().includes(facultySearchTerm.toLowerCase())
  );

  // Get available days for selected course and faculty
  const availableDays = cardData.selectedFaculty
    ? Array.from(
        new Set(
          programCourses
            .filter(course => {
              const courseMatch = `${course.courseCode} - ${course.title}` === cardData.selectedCourse;
              const facultyMatch = `${course.facultyName} (${course.facultyInitial})` === cardData.selectedFaculty;
              return courseMatch && facultyMatch;
            })
            .map(course => {
              // Create day combination string like the table shows
              if (course.day1 && course.day2) {
                return `${course.day1} - ${course.day2}`;
              } else if (course.day1) {
                return course.day1;
              }
              return '';
            })
            .filter(Boolean)
        )
      )
    : [];

  // Get available times for selected course, faculty, and day
  const availableTimes = cardData.selectedDay
    ? Array.from(
        new Set(
          programCourses
            .filter(course => {
              const courseMatch = `${course.courseCode} - ${course.title}` === cardData.selectedCourse;
              const facultyMatch = `${course.facultyName} (${course.facultyInitial})` === cardData.selectedFaculty;
              
              // Match the day combination
              let dayMatch = false;
              if (course.day1 && course.day2) {
                dayMatch = `${course.day1} - ${course.day2}` === cardData.selectedDay;
              } else if (course.day1) {
                dayMatch = course.day1 === cardData.selectedDay;
              }
              
              return courseMatch && facultyMatch && dayMatch;
            })
            .map(course => {
              // Return the time that corresponds to the selected day pattern
              if (course.day1 && course.day2) {
                // For courses with two days, typically they have the same time
                return course.time1;
              } else {
                // For single day courses
                return course.time1;
              }
            })
            .filter(Boolean)
        )
      )
    : [];

  // Get final section when all selections are made
  useEffect(() => {
    if (cardData.selectedCourse && cardData.selectedFaculty && cardData.selectedDay && cardData.selectedTime) {
      const matchingCourse = programCourses.find(course => {
        const courseMatch = `${course.courseCode} - ${course.title}` === cardData.selectedCourse;
        const facultyMatch = `${course.facultyName} (${course.facultyInitial})` === cardData.selectedFaculty;
        
        // Match the day combination
        let dayMatch = false;
        if (course.day1 && course.day2) {
          dayMatch = `${course.day1} - ${course.day2}` === cardData.selectedDay;
        } else if (course.day1) {
          dayMatch = course.day1 === cardData.selectedDay;
        }
        
        const timeMatch = course.time1 === cardData.selectedTime || course.time2 === cardData.selectedTime;
        return courseMatch && facultyMatch && dayMatch && timeMatch;
      });

      if (matchingCourse && matchingCourse !== cardData.finalSection) {
        onUpdate(cardData.id, { finalSection: matchingCourse });
        
        // Automatically add to selected courses if not already selected
        const isAlreadySelected = selectedCourses.some(course => 
          course.courseCode === matchingCourse.courseCode && 
          course.section === matchingCourse.section
        );
        
        if (!isAlreadySelected) {
          onAddSection(matchingCourse);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData.selectedCourse, cardData.selectedFaculty, cardData.selectedDay, cardData.selectedTime]);

  const handleCourseSelect = (courseString: string) => {
    onUpdate(cardData.id, {
      selectedCourse: courseString,
      selectedFaculty: "",
      selectedDay: "",
      selectedTime: "",
      finalSection: undefined,
    });
    setSearchTerm("");
  };

  const handleFacultySelect = (facultyString: string) => {
    onUpdate(cardData.id, {
      selectedFaculty: facultyString,
      selectedDay: "",
      selectedTime: "",
      finalSection: undefined,
    });
    setFacultySearchTerm("");
  };

  const handleClear = () => {
    // If there's a final section, remove it from selected courses
    if (cardData.finalSection) {
      onRemoveSection(cardData.finalSection);
    }
    
    onUpdate(cardData.id, {
      selectedCourse: "",
      selectedFaculty: "",
      selectedDay: "",
      selectedTime: "",
      finalSection: undefined,
    });
    setSearchTerm("");
    setFacultySearchTerm("");
    setIsCourseFocused(false);
    setIsFacultyFocused(false);
  };

  // Check if the final section is already selected
  const isAlreadySelected = cardData.finalSection ? 
    selectedCourses.some(course => 
      course.courseCode === cardData.finalSection!.courseCode && 
      course.section === cardData.finalSection!.section
    ) : false;

  // Check for schedule conflicts
  const conflicts = cardData.finalSection ? checkConflict(cardData.finalSection) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Course Selection</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(cardData.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* All Selection Inputs - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Course Search */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium">Search course</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="DSA, DM, CSE 2218..."
                value={cardData.selectedCourse ? `${cardData.selectedCourse.split(' - ')[0]} (${cardData.selectedCourse.split(' - ')[1]})` : searchTerm}
                onChange={(e) => {
                  if (!cardData.selectedCourse) {
                    setSearchTerm(e.target.value);
                  }
                }}
                onFocus={() => {
                  if (!cardData.selectedCourse) {
                    setIsCourseFocused(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow clicking on dropdown items
                  setTimeout(() => setIsCourseFocused(false), 150);
                }}
                className={`w-full ${cardData.selectedCourse ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''}`}
                readOnly={!!cardData.selectedCourse}
              />
              {!cardData.selectedCourse && (isCourseFocused || searchTerm) && filteredCourses.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto">
                  {filteredCourses.slice(0, 10).map((course, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        handleCourseSelect(`${course.courseCode} - ${course.title}`);
                        setIsCourseFocused(false);
                      }}
                    >
                      <div className="font-medium text-sm">{course.courseCode}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{course.title}</div>
                    </div>
                  ))}
                  {filteredCourses.length > 10 && (
                    <div className="p-2 text-xs text-muted-foreground text-center bg-muted">
                      Showing first 10 results. Keep typing to narrow down...
                    </div>
                  )}
                </div>
              )}
              {!cardData.selectedCourse && (isCourseFocused || searchTerm) && filteredCourses.length === 0 && searchTerm && (
                <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 p-3">
                  <div className="text-sm text-muted-foreground">No courses found matching &ldquo;{searchTerm}&rdquo;</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Try searching with course code, full name, or abbreviations like &ldquo;DSA&rdquo;, &ldquo;DM&rdquo;, etc.
                  </div>
                </div>
              )}
              {cardData.selectedCourse && (
                <button
                  onClick={() => {
                    // If there's a final section when clearing course, remove it
                    if (cardData.finalSection) {
                      onRemoveSection(cardData.finalSection);
                    }
                    
                    onUpdate(cardData.id, { selectedCourse: "", selectedFaculty: "", selectedDay: "", selectedTime: "", finalSection: undefined });
                    setSearchTerm("");
                    setFacultySearchTerm("");
                    setIsCourseFocused(false);
                    setIsFacultyFocused(false);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Faculty Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select faculty</label>
            <div className="relative">
              <Input
                type="text"
                placeholder={!cardData.selectedCourse ? "Select course first" : "Search faculty..."}
                value={cardData.selectedFaculty ? cardData.selectedFaculty.split('(')[0].trim() : facultySearchTerm}
                onChange={(e) => {
                  if (!cardData.selectedFaculty && cardData.selectedCourse) {
                    setFacultySearchTerm(e.target.value);
                  }
                }}
                onFocus={() => {
                  if (!cardData.selectedFaculty && cardData.selectedCourse) {
                    setIsFacultyFocused(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow clicking on dropdown items
                  setTimeout(() => setIsFacultyFocused(false), 150);
                }}
                className={`w-full ${
                  !cardData.selectedCourse ? 'opacity-50' : ''
                } ${cardData.selectedFaculty ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''}`}
                disabled={!cardData.selectedCourse}
                readOnly={!!cardData.selectedFaculty}
              />
              {!cardData.selectedFaculty && cardData.selectedCourse && (isFacultyFocused || facultySearchTerm) && filteredFaculties.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto">
                  {filteredFaculties.map((faculty, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        handleFacultySelect(faculty);
                        setIsFacultyFocused(false);
                      }}
                    >
                      <div className="font-medium text-sm">{faculty}</div>
                    </div>
                  ))}
                </div>
              )}
              {!cardData.selectedFaculty && cardData.selectedCourse && (isFacultyFocused || facultySearchTerm) && filteredFaculties.length === 0 && facultySearchTerm && (
                <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-md mt-1 p-3">
                  <div className="text-sm text-muted-foreground">No faculty found matching &ldquo;{facultySearchTerm}&rdquo;</div>
                </div>
              )}
              {cardData.selectedFaculty && (
                <button
                  onClick={() => {
                    // If there's a final section when clearing faculty, remove it  
                    if (cardData.finalSection) {
                      onRemoveSection(cardData.finalSection);
                    }
                    
                    onUpdate(cardData.id, { selectedFaculty: "", selectedDay: "", selectedTime: "", finalSection: undefined });
                    setFacultySearchTerm("");
                    setIsFacultyFocused(false);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Day Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select day</label>
            <Select
              value={cardData.selectedDay}
              onValueChange={(value: string) => onUpdate(cardData.id, { selectedDay: value, selectedTime: "", finalSection: undefined })}
              disabled={!cardData.selectedFaculty}
            >
              <SelectTrigger className={`${!cardData.selectedFaculty ? "opacity-50" : ""} ${cardData.selectedDay ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''}`}>
                <SelectValue placeholder={!cardData.selectedFaculty ? "Select faculty first" : "Choose day"} />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map((day, index) => (
                  <SelectItem key={index} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select time</label>
            <Select
              value={cardData.selectedTime}
              onValueChange={(value: string) => onUpdate(cardData.id, { selectedTime: value })}
              disabled={!cardData.selectedDay}
            >
              <SelectTrigger className={`${!cardData.selectedDay ? "opacity-50" : ""} ${cardData.selectedTime ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''}`}>
                <SelectValue placeholder={!cardData.selectedDay ? "Select day first" : "Choose time"} />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time, index) => (
                  <SelectItem key={index} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Final Section Display */}
        {cardData.finalSection && (
          <div className={`space-y-3 p-4 rounded-lg border ${
            conflicts.length > 0
              ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800"
              : isAlreadySelected 
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800"
                : "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800"
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                conflicts.length > 0 
                  ? "bg-red-500" 
                  : isAlreadySelected 
                    ? "bg-blue-500" 
                    : "bg-emerald-500"
              }`}></div>
              <span className={`font-semibold ${
                conflicts.length > 0
                  ? "text-red-800 dark:text-red-200"
                  : isAlreadySelected 
                    ? "text-blue-800 dark:text-blue-200" 
                    : "text-emerald-800 dark:text-emerald-200"
              }`}>
                {conflicts.length > 0 ? "Schedule Conflict" : isAlreadySelected ? "Added to Selection" : "Auto-Added to Selection"}
              </span>
              {isAlreadySelected && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Selected
                </span>
              )}
              {conflicts.length > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                  {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Conflict Details */}
            {conflicts.length > 0 && (
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-md">
                <div className="font-medium text-sm text-red-800 dark:text-red-200 mb-2">
                  This section conflicts with:
                </div>
                {conflicts.map((conflict, index) => (
                  <div key={index} className="text-sm text-red-700 dark:text-red-300">
                    • {conflict.courseCode} {conflict.section} - {conflict.day1}{conflict.day2 ? ` - ${conflict.day2}` : ''} at {conflict.time1}
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div><span className="font-medium">Section:</span> {cardData.finalSection.section}</div>
                <div><span className="font-medium">Credit:</span> {cardData.finalSection.credit}</div>
              </div>
              <div className="space-y-1">
                <div><span className="font-medium">Time:</span> {cardData.finalSection.time1}</div>
                <div><span className="font-medium">Room:</span> {cardData.finalSection.room1}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CourseCardSelector({ courses, selectedCourses, onCourseSelect, onClearAllSelected }: CourseCardSelectorProps) {
  const [program, setProgram] = useState<string>("BSCSE");
  const [cards, setCards] = useState<CourseCardData[]>([{ id: "1", selectedCourse: "", selectedFaculty: "", selectedDay: "", selectedTime: "" }]);
  const lastSelectedCoursesRef = useRef<Course[]>([]);
  const previousProgramRef = useRef<string>("BSCSE");

  // Effect to sync cards with selected courses - create cards for externally selected courses
  useEffect(() => {
    // Check if selectedCourses actually changed
    const selectedCoursesChanged = 
      selectedCourses.length !== lastSelectedCoursesRef.current.length ||
      selectedCourses.some((course, index) => {
        const lastCourse = lastSelectedCoursesRef.current[index];
        return !lastCourse || course.courseCode !== lastCourse.courseCode || course.section !== lastCourse.section;
      });
    
    if (!selectedCoursesChanged) {
      return;
    }
    
    lastSelectedCoursesRef.current = [...selectedCourses];
    
    setCards(prevCards => {
      const existingCardCourses = prevCards
        .filter(card => card.finalSection)
        .map(card => `${card.finalSection!.courseCode}-${card.finalSection!.section}`);
      
      const selectedCoursesIds = selectedCourses.map(course => `${course.courseCode}-${course.section}`);
      
      // Find courses that are selected but don't have cards
      const coursesNeedingCards = selectedCourses.filter(course => {
        const courseId = `${course.courseCode}-${course.section}`;
        return !existingCardCourses.includes(courseId) && course.program === program;
      });
      
      let newCards = [...prevCards];
      
      // Create cards for newly selected courses
      coursesNeedingCards.forEach(course => {
        // Check if we have an empty card we can use
        const emptyCardIndex = newCards.findIndex(card => 
          !card.selectedCourse && !card.selectedFaculty && !card.selectedDay && !card.selectedTime && !card.finalSection
        );
        
        if (emptyCardIndex !== -1) {
          // Use existing empty card
          newCards[emptyCardIndex] = {
            ...newCards[emptyCardIndex],
            selectedCourse: `${course.courseCode} - ${course.title}`,
            selectedFaculty: `${course.facultyName} (${course.facultyInitial})`,
            selectedDay: course.day1 && course.day2 ? `${course.day1} - ${course.day2}` : course.day1,
            selectedTime: course.time1,
            finalSection: course,
          };
        } else {
          // Create new card
          const newId = (Math.max(...newCards.map(c => parseInt(c.id))) + 1).toString();
          newCards.push({
            id: newId,
            selectedCourse: `${course.courseCode} - ${course.title}`,
            selectedFaculty: `${course.facultyName} (${course.facultyInitial})`,
            selectedDay: course.day1 && course.day2 ? `${course.day1} - ${course.day2}` : course.day1,
            selectedTime: course.time1,
            finalSection: course,
          });
        }
      });
      
      // Remove cards for courses that are no longer selected
      newCards = newCards.map(card => {
        if (card.finalSection) {
          const courseId = `${card.finalSection.courseCode}-${card.finalSection.section}`;
          if (!selectedCoursesIds.includes(courseId)) {
            // Course was removed externally, clear the card
            return {
              ...card,
              selectedCourse: "",
              selectedFaculty: "",
              selectedDay: "",
              selectedTime: "",
              finalSection: undefined,
            };
          }
        }
        return card;
      });
      
      return newCards;
    });
  }, [selectedCourses, program]);

  // Effect to clear cards when program changes if their courses don't match the new program  
  useEffect(() => {
    // Only clear if program actually changed
    if (previousProgramRef.current !== program) {
      previousProgramRef.current = program;
      
      setCards(prevCards => {
        return prevCards.map(card => {
          // Clear ALL card data (both complete and partial selections) when program changes
          return {
            ...card,
            selectedCourse: "",
            selectedFaculty: "",
            selectedDay: "",
            selectedTime: "",
            finalSection: undefined,
          };
        });
      });
      
      // Clear all selected courses when program changes
      onClearAllSelected();
    }
  }, [program, onClearAllSelected]);

  // Function to check for schedule conflicts
  const checkScheduleConflict = (newCourse: Course): Course[] => {
    const conflicts: Course[] = [];
    
    // Extract days and times from the new course
    const newCourseDays = [newCourse.day1, newCourse.day2].filter(Boolean);
    const newCourseTimes = [newCourse.time1, newCourse.time2].filter(Boolean);
    
    selectedCourses.forEach(existingCourse => {
      // Skip if it's the same course (updating existing selection)
      if (existingCourse.courseCode === newCourse.courseCode && 
          existingCourse.section === newCourse.section) {
        return;
      }
      
      const existingDays = [existingCourse.day1, existingCourse.day2].filter(Boolean);
      const existingTimes = [existingCourse.time1, existingCourse.time2].filter(Boolean);
      
      // Check for day overlap
      const hasCommonDay = newCourseDays.some(newDay => 
        existingDays.some(existingDay => existingDay === newDay)
      );
      
      // Check for time overlap
      const hasCommonTime = newCourseTimes.some(newTime => 
        existingTimes.some(existingTime => existingTime === newTime)
      );
      
      // If both day and time overlap, it's a conflict
      if (hasCommonDay && hasCommonTime) {
        conflicts.push(existingCourse);
      }
    });
    
    return conflicts;
  };

  const updateCard = (id: string, updates: Partial<CourseCardData>) => {
    setCards(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
  };

  const deleteCard = (id: string) => {
    if (cards.length > 1) {
      // Find the card being deleted and remove its course from selected courses
      const cardToDelete = cards.find(card => card.id === id);
      if (cardToDelete?.finalSection) {
        onCourseSelect(cardToDelete.finalSection); // This will remove it since it's already selected
      }
      setCards(prev => prev.filter(card => card.id !== id));
    }
  };

  const addCard = () => {
    const newId = (Math.max(...cards.map(c => parseInt(c.id))) + 1).toString();
    setCards(prev => [...prev, { id: newId, selectedCourse: "", selectedFaculty: "", selectedDay: "", selectedTime: "" }]);
  };

  const handleAddSection = (course: Course) => {
    onCourseSelect(course);
  };

  const handleRemoveSection = (course: Course) => {
    onCourseSelect(course); // This toggles the selection
  };

  return (
    <div className="space-y-6">
      {/* Program Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Program Selector</CardTitle>
          <CardDescription>Choose your program to filter available courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BSCSE">BSCSE - Computer Science & Engineering</SelectItem>
              <SelectItem value="BSDS">BSDS - Data Science</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <div className="font-medium mb-1">Search Tips:</div>
            <div>• Use course codes: CSE 2218, MAT 1101</div>
            <div>• Use abbreviations: DSA, DM, AI, ML, OS</div>
            <div>• Use numbers for Roman numerals: 1 for I, 2 for II</div>
          </div>
        </CardContent>
      </Card>

      {/* Course Cards */}
      <div className="space-y-4">
        {cards.map((card) => (
          <CourseCard
            key={card.id}
            cardData={card}
            courses={courses}
            program={program}
            selectedCourses={selectedCourses}
            onUpdate={updateCard}
            onDelete={deleteCard}
            onAddSection={handleAddSection}
            onRemoveSection={handleRemoveSection}
            checkConflict={checkScheduleConflict}
          />
        ))}
      </div>

      {/* Add More Button */}
      <Button 
        onClick={addCard} 
        variant="outline" 
        className="w-full border-dashed border-2 hover:border-solid hover:bg-muted/50 h-12 text-muted-foreground hover:text-foreground"
      >
        <span className="text-lg mr-2">+</span>
        Add More Course Card
      </Button>
    </div>
  );
}

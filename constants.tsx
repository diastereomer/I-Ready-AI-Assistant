
import { ArchitectureType, ArchitectureInfo, Problem } from './types';

export const ARCHITECTURES: ArchitectureInfo[] = [
  {
    id: ArchitectureType.CHROME_EXTENSION,
    title: "Sidepanel Extension",
    description: "Lives inside the Chrome Browser. Injects scripts to read I-Ready's DOM and provides tutoring without leaving the tab.",
    benefits: [
      "Zero Context Switching: Stays on the same page.",
      "High Accuracy: Reads raw text data directly from I-Ready.",
      "Native Feel: Uses Chrome's built-in sidepanel API."
    ],
    techStack: ["Gemini 3 Flash", "Content Scripts", "Chrome Sidepanel API"],
    chromebookNote: "Best for web-based I-Ready users on managed Chromebooks."
  },
  {
    id: ArchitectureType.MULTIMODAL_VISION,
    title: "Vision-Based PWA",
    description: "A separate app that 'watches' the screen using Chrome's screen-capture API to analyze diagrams and images.",
    benefits: [
      "Diagram Support: Can explain graphs and geometry shapes.",
      "Platform Agnostic: Works even if I-Ready is an Android app.",
      "Human-Like: 'Sees' exactly what the kid sees."
    ],
    techStack: ["Gemini 2.5 Flash", "getDisplayMedia API", "Multimodal Reasoning"],
    chromebookNote: "Perfect for complex math problems involving visuals/graphs."
  },
  {
    id: ArchitectureType.ACCESSIBILITY_BRIDGE,
    title: "Accessibility Service",
    description: "Uses the system's accessibility tree to track the student's progress and intervene when a 'struggle' state is detected.",
    benefits: [
      "Proactive: Intervenes when focus stays on one item too long.",
      "Privacy Focused: Only reads relevant metadata.",
      "Low Latency: Doesn't require high-bandwidth video upload."
    ],
    techStack: ["Gemini 3 Pro", "Accessibility Tree API", "Event Listeners"],
    chromebookNote: "Ideal for district-wide deployments with administrative control."
  }
];

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "g1",
    subject: "Math",
    question: "Look at the triangle below. If the side labeled 'a' is 3cm and 'b' is 4cm, what is the length of the longest side 'c'?",
    correctAnswer: "5",
    context: "Pythagorean Theorem and right-angle triangle identification.",
    difficulty: "Hard",
    shapes: [
      { type: 'triangle', label: 'Right Triangle', dimensions: ['a=3', 'b=4', 'c=?'], color: '#3b82f6' }
    ]
  },
  {
    id: "m1",
    subject: "Math",
    question: "If Sally has 12 apples and gives 4 to her friend, how many apples does she have left?",
    correctAnswer: "8",
    context: "Basic arithmetic.",
    difficulty: "Medium"
  }
];

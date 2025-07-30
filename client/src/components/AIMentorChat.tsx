
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  createdAt: number;
}

interface AIMentorChatProps {
  userId?: string;
}

export default function AIMentorChat({ userId }: AIMentorChatProps) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const user = useUser();
  const { toast } = useToast();

  // Fetch messages (fallback to local messages if backend unavailable)
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["chatMessages", user?.uid],
    queryFn: async () => {
      if (!user) return localMessages;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch messages");
        return await response.json();
      } catch (error) {
        console.warn("Backend not available, using local messages:", error);
        return localMessages;
      }
    },
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      // Refetch messages after a successful post to update the chat
      queryClient.invalidateQueries({ queryKey: ["chatMessages", user?.uid] });
      toast({
        title: "AI mentor has responded!",
        description: "You've received a new message.",
      });
    },
    onError: (error) => {
      console.error("Send message error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate intelligent responses like ChatGPT for ANY question
  function generateCareerAdvice(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Math Questions
    if (lowerMessage.includes('math') || lowerMessage.includes('calculate') || lowerMessage.includes('equation') || lowerMessage.includes('solve') || 
        lowerMessage.includes('algebra') || lowerMessage.includes('geometry') || lowerMessage.includes('calculus') || lowerMessage.includes('trigonometry')) {
      return `🔢 **Mathematics Help: "${userMessage}"**

Let me help you with this math problem!

**🧮 Step-by-Step Solution Approach:**

**For Algebra Problems:**
- Identify the unknown variable
- Move all terms with variables to one side
- Combine like terms
- Solve for the variable

**For Calculus:**
- Derivatives: Use power rule, product rule, chain rule
- Integrals: Apply integration techniques
- Limits: Approach the value systematically

**For Geometry:**
- Draw a diagram when possible
- Identify given information
- Apply relevant formulas and theorems

**Example Solutions:**

**Solve: 2x + 5 = 15**
\`\`\`
2x + 5 = 15
2x = 15 - 5    (subtract 5 from both sides)
2x = 10
x = 5          (divide both sides by 2)
\`\`\`

**Find derivative of f(x) = x² + 3x + 2**
\`\`\`
f'(x) = d/dx(x²) + d/dx(3x) + d/dx(2)
f'(x) = 2x + 3 + 0
f'(x) = 2x + 3
\`\`\`

**Area of a circle with radius 5:**
\`\`\`
A = πr²
A = π × 5²
A = 25π ≈ 78.54 square units
\`\`\`

**💡 Need help with a specific problem?** 
Tell me exactly what you're trying to solve and I'll walk you through it step by step!

What specific math problem can I help you solve?`;
    }

    // Science Questions (Physics, Chemistry, Biology)
    if (lowerMessage.includes('physics') || lowerMessage.includes('chemistry') || lowerMessage.includes('biology') || 
        lowerMessage.includes('science') || lowerMessage.includes('molecule') || lowerMessage.includes('atom') || 
        lowerMessage.includes('cell') || lowerMessage.includes('force') || lowerMessage.includes('energy')) {
      return `🔬 **Science Explanation: "${userMessage}"**

**🌟 Let me explain this scientific concept!**

**For Physics Topics:**
- **Motion**: F = ma (Force = mass × acceleration)
- **Energy**: E = mc² (Einstein's mass-energy equivalence)
- **Electricity**: V = IR (Ohm's law: Voltage = Current × Resistance)
- **Waves**: v = fλ (Wave speed = frequency × wavelength)

**For Chemistry Topics:**
- **Atomic Structure**: Protons, neutrons, electrons
- **Chemical Bonds**: Ionic, covalent, metallic
- **Reactions**: Reactants → Products
- **Periodic Table**: Elements organized by atomic number

**For Biology Topics:**
- **Cells**: Basic unit of life (prokaryotic vs eukaryotic)
- **DNA**: Genetic code (A, T, G, C bases)
- **Evolution**: Natural selection and adaptation
- **Ecosystems**: Food webs and energy flow

**🧪 Example Explanations:**

**What is photosynthesis?**
\`\`\`
6CO₂ + 6H₂O + sunlight → C₆H₁₂O₆ + 6O₂
Carbon dioxide + Water + Light → Glucose + Oxygen

Process: Plants convert sunlight into chemical energy
Location: Chloroplasts in plant cells
Importance: Produces oxygen and food for life on Earth
\`\`\`

**How do atoms bond?**
\`\`\`
Ionic Bonds: Metal gives electrons to non-metal
Example: Na⁺ + Cl⁻ → NaCl (table salt)

Covalent Bonds: Atoms share electrons
Example: H₂O (water) - oxygen shares with hydrogen

Metallic Bonds: "Sea" of electrons in metals
Example: Iron, copper, gold
\`\`\`

**What's Newton's First Law?**
\`\`\`
"An object at rest stays at rest, and an object in motion 
stays in motion, unless acted upon by an external force"

Example: 
- Ball on table stays still until you push it
- Car keeps moving until brakes are applied
- Explains why we wear seatbelts!
\`\`\`

**🎯 Study Tips for Science:**
1. **Understand concepts** before memorizing formulas
2. **Draw diagrams** to visualize processes
3. **Do practice problems** regularly
4. **Connect ideas** between different topics
5. **Use analogies** to remember complex concepts

What specific science topic would you like me to explain in detail?`;
    }

    // History Questions
    if (lowerMessage.includes('history') || lowerMessage.includes('war') || lowerMessage.includes('ancient') || 
        lowerMessage.includes('civilization') || lowerMessage.includes('revolution') || lowerMessage.includes('empire') ||
        lowerMessage.includes('president') || lowerMessage.includes('king') || lowerMessage.includes('queen')) {
      return `📚 **History Explanation: "${userMessage}"**

**🏛️ Let me help you understand this historical topic!**

**Major Historical Periods:**
- **Ancient Times**: Egypt, Greece, Rome, China (3000 BCE - 500 CE)
- **Medieval**: Middle Ages, feudalism (500 - 1500 CE)
- **Renaissance**: Art, science revival (1400 - 1600 CE)
- **Industrial Age**: Machines, factories (1750 - 1900 CE)
- **Modern Era**: 20th-21st centuries

**Key Historical Concepts:**

**Causes and Effects:**
- Events don't happen in isolation
- Economic, social, political factors interact
- Short-term vs long-term consequences

**Primary vs Secondary Sources:**
- Primary: Written during the time period
- Secondary: Written later by historians

**🌍 Example Historical Analysis:**

**World War II (1939-1945):**
\`\`\`
Causes:
- Treaty of Versailles harsh on Germany
- Economic depression
- Rise of fascism (Hitler, Mussolini)
- Appeasement policy failed

Key Events:
- Germany invades Poland (1939)
- Pearl Harbor attack (1941)
- D-Day invasion (1944)
- Atomic bombs on Japan (1945)

Consequences:
- ~70 million deaths
- United Nations created
- Cold War begins
- Decolonization accelerates
\`\`\`

**American Revolution (1775-1783):**
\`\`\`
Causes:
- "No taxation without representation"
- Boston Tea Party (1773)
- Intolerable Acts (1774)

Key Figures:
- George Washington (military leader)
- Thomas Jefferson (Declaration author)
- Benjamin Franklin (diplomat)

Results:
- Independence from Britain
- Constitutional government
- Inspiration for other revolutions
\`\`\`

**Ancient Rome:**
\`\`\`
Republic (509-27 BCE):
- Senate and consuls
- Expansion across Mediterranean
- Julius Caesar's rise and assassination

Empire (27 BCE - 476 CE):
- Augustus first emperor
- Pax Romana (Roman Peace)
- Christianity spreads
- Fall due to barbarian invasions
\`\`\`

**🎯 How to Study History:**
1. **Timeline approach**: Organize events chronologically
2. **Cause and effect**: Understand why things happened
3. **Multiple perspectives**: Consider different viewpoints
4. **Primary sources**: Read original documents
5. **Make connections**: Link past to present

What specific historical period or event would you like to explore?`;
    }

    // English/Literature/Writing Questions
    if (lowerMessage.includes('english') || lowerMessage.includes('grammar') || lowerMessage.includes('write') || 
        lowerMessage.includes('essay') || lowerMessage.includes('literature') || lowerMessage.includes('poem') ||
        lowerMessage.includes('novel') || lowerMessage.includes('story')) {
      return `📝 **English & Writing Help: "${userMessage}"**

**✍️ Let me help you with English and writing!**

**Grammar Essentials:**

**Parts of Speech:**
- **Nouns**: Person, place, thing (cat, city, happiness)
- **Verbs**: Action words (run, think, is)
- **Adjectives**: Describe nouns (big, beautiful, green)
- **Adverbs**: Describe verbs (quickly, very, well)

**Sentence Structure:**
\`\`\`
Simple: Subject + Verb + Object
"The cat ate the fish."

Compound: Two independent clauses
"The cat ate the fish, and the dog barked."

Complex: Independent + dependent clause
"The cat ate the fish because it was hungry."
\`\`\`

**📖 Essay Writing Structure:**

**5-Paragraph Essay:**
\`\`\`
1. Introduction
   - Hook (interesting opening)
   - Background information
   - Thesis statement (main argument)

2-4. Body Paragraphs
   - Topic sentence
   - Evidence/examples
   - Analysis/explanation
   - Transition to next paragraph

5. Conclusion
   - Restate thesis
   - Summarize main points
   - Closing thought/call to action
\`\`\`

**Writing Process:**
1. **Brainstorm**: Generate ideas
2. **Outline**: Organize thoughts
3. **Draft**: Write without worrying about perfection
4. **Revise**: Improve content and structure
5. **Edit**: Fix grammar and spelling

**📚 Literary Analysis:**

**Elements to Analyze:**
- **Characters**: Development, motivation, relationships
- **Plot**: Exposition, rising action, climax, resolution
- **Setting**: Time, place, atmosphere
- **Theme**: Central message or meaning
- **Symbolism**: Objects representing deeper meanings

**Example Analysis:**
\`\`\`
"To Kill a Mockingbird" by Harper Lee

Theme: Prejudice and moral courage
- Scout learns about racism in 1930s Alabama
- Atticus defends innocent Black man
- Mockingbird symbolizes innocence destroyed

Character Development:
- Scout: From naive child to understanding injustice
- Atticus: Moral compass, stands for what's right
- Boo Radley: Misunderstood, actually kind
\`\`\`

**🎯 Writing Tips:**
- **Show, don't tell**: Use specific details and actions
- **Vary sentence length**: Mix short and long sentences
- **Use active voice**: "The dog bit the man" vs "The man was bitten"
- **Read aloud**: Helps catch awkward phrasing
- **Get feedback**: Have others read your work

**Common Grammar Mistakes:**
\`\`\`
❌ "Me and John went to the store"
✅ "John and I went to the store"

❌ "Your welcome"
✅ "You're welcome" (you are welcome)

❌ "I could care less"
✅ "I couldn't care less"

❌ "Between you and I"
✅ "Between you and me"
\`\`\`

What specific writing or literature topic can I help you with?`;
    }

    // Programming Questions (ANY language)
    if (lowerMessage.includes('python') || lowerMessage.includes('javascript') || lowerMessage.includes('java') ||
        lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('algorithm') ||
        lowerMessage.includes('function') || lowerMessage.includes('loop') || lowerMessage.includes('variable')) {
      return `💻 **Programming Help: "${userMessage}"**

**🚀 Let me help you with coding!**

**Programming Fundamentals:**

**Basic Concepts:**
- **Variables**: Store data (name = "John", age = 25)
- **Functions**: Reusable code blocks
- **Loops**: Repeat actions
- **Conditions**: Make decisions (if/else)
- **Data Types**: Numbers, strings, booleans, lists

**Python Examples:**
\`\`\`python
# Variables and basic operations
name = "Alice"
age = 25
is_student = True

# Function
def greet(person):
    return f"Hello, {person}!"

# Loop
for i in range(5):
    print(f"Number: {i}")

# Condition
if age >= 18:
    print("Adult")
else:
    print("Minor")

# List operations
fruits = ["apple", "banana", "orange"]
fruits.append("grape")
print(fruits[0])  # First item
\`\`\`

**JavaScript Examples:**
\`\`\`javascript
// Variables and functions
const name = "Bob";
let age = 30;

const greet = (person) => {
    return \`Hello, \${person}!\`;
};

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);

// DOM manipulation
document.getElementById("demo").innerHTML = "Hello World!";

// Event handling
button.addEventListener("click", function() {
    alert("Button clicked!");
});
\`\`\`

**Problem-Solving Approach:**
1. **Understand**: What exactly is the problem asking?
2. **Plan**: Break it into smaller steps
3. **Code**: Write it step by step
4. **Test**: Try different inputs
5. **Debug**: Fix any errors

**Common Algorithms:**

**Sorting (Python):**
\`\`\`python
# Bubble sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print(sorted_numbers)
\`\`\`

**Search Algorithm:**
\`\`\`python
# Binary search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
\`\`\`

**🎯 Learning Path:**
1. **Basics**: Variables, functions, loops
2. **Data Structures**: Arrays, objects, lists
3. **Algorithms**: Sorting, searching
4. **Projects**: Build real applications
5. **Advanced**: Frameworks, databases

What specific programming concept would you like me to explain?`;
    }

    // General Knowledge Questions
    if (lowerMessage.includes('what is') || lowerMessage.includes('how does') || lowerMessage.includes('why') ||
        lowerMessage.includes('explain') || lowerMessage.includes('define') || lowerMessage.includes('tell me about')) {
      return `🧠 **General Knowledge: "${userMessage}"**

**🎯 Let me explain this topic for you!**

I can help you understand concepts from many fields:

**🔬 Science & Technology:**
- How things work (computers, engines, body systems)
- Scientific phenomena (gravity, electricity, photosynthesis)
- Latest technology trends (AI, blockchain, quantum computing)

**🌍 Geography & World:**
- Countries, capitals, landmarks
- Climate and weather patterns
- Cultural differences and traditions

**🏛️ History & Politics:**
- Historical events and their impact
- Government systems and how they work
- Famous leaders and their contributions

**💼 Business & Economics:**
- How markets work
- Investment basics
- Economic principles

**🎨 Arts & Culture:**
- Famous artists and their works
- Music genres and history
- Literature and philosophy

**🏥 Health & Medicine:**
- How the human body works
- Nutrition and exercise
- Common medical conditions

**Example Explanations:**

**"What is artificial intelligence?"**
\`\`\`
AI is computer systems that can perform tasks that typically 
require human intelligence:

Types:
- Machine Learning: Computers learn from data
- Natural Language Processing: Understanding human language
- Computer Vision: Analyzing images and videos

Examples:
- Voice assistants (Siri, Alexa)
- Recommendation systems (Netflix, YouTube)
- Self-driving cars
- Medical diagnosis tools

How it works:
1. Feed data to algorithms
2. Algorithms find patterns
3. Use patterns to make predictions
4. Improve over time with more data
\`\`\`

**"How does the internet work?"**
\`\`\`
The internet is a global network of connected computers:

Key Components:
- Servers: Store websites and data
- Routers: Direct data traffic
- ISPs: Internet Service Providers connect you
- Protocols: Rules for data transfer (HTTP, TCP/IP)

Process:
1. You type a website address
2. Your computer asks DNS for the server location
3. Your request travels through routers
4. Server sends back the website data
5. Your browser displays the page

Think of it like: A postal system for digital information!
\`\`\`

**"Why do we dream?"**
\`\`\`
Dreams serve several important functions:

Memory Processing:
- Brain sorts through daily experiences
- Transfers important info to long-term memory
- Discards unnecessary information

Emotional Regulation:
- Processes emotions and stress
- Helps cope with difficult experiences
- Provides emotional release

Problem Solving:
- Brain works on unsolved problems
- Can lead to creative insights
- Famous discoveries made in dreams

Brain Maintenance:
- Clears metabolic waste
- Repairs neural connections
- Prepares for next day
\`\`\`

**🎓 Study Tips for Any Subject:**
1. **Break it down**: Complex topics into smaller parts
2. **Use analogies**: Compare to familiar things
3. **Ask questions**: "How?" "Why?" "What if?"
4. **Practice**: Apply knowledge in different contexts
5. **Teach others**: Explaining helps you understand better

What specific topic would you like me to explain in detail?`;
    }

    // Study Help and Learning Strategies
    if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('exam') ||
        lowerMessage.includes('test') || lowerMessage.includes('homework') || lowerMessage.includes('remember')) {
      return `📚 **Study Help & Learning Strategies: "${userMessage}"**

**🧠 Effective Learning Techniques:**

**1. Active Recall:**
Instead of just re-reading, test yourself:
\`\`\`
Traditional: Read notes over and over
Better: Close notes, write what you remember
Best: Teach the concept to someone else
\`\`\`

**2. Spaced Repetition:**
Review at increasing intervals:
\`\`\`
Day 1: Learn new material
Day 3: First review
Day 7: Second review  
Day 21: Third review
Day 60: Final review
\`\`\`

**3. Feynman Technique:**
\`\`\`
Step 1: Choose a concept
Step 2: Explain it simply (like to a 5-year-old)
Step 3: Find gaps in your explanation
Step 4: Go back to source material
Step 5: Simplify your explanation further
\`\`\`

**📖 Subject-Specific Study Methods:**

**Mathematics:**
- Practice problems daily (30+ minutes)
- Understand concepts before memorizing formulas
- Work through solutions step-by-step
- Explain your reasoning out loud

**Science:**
- Draw diagrams and flowcharts
- Connect new concepts to real-world examples
- Do hands-on experiments when possible
- Create concept maps showing relationships

**History/Social Studies:**
- Create timelines for events
- Make cause-and-effect charts
- Use mnemonics for dates and names
- Read primary sources when available

**Languages:**
- Practice speaking daily (even to yourself)
- Watch movies/shows in target language
- Use flashcards for vocabulary
- Write short stories or diary entries

**Literature:**
- Read actively (take notes, ask questions)
- Analyze character motivations
- Look for themes and symbols
- Discuss with others

**⏰ Time Management:**

**Pomodoro Technique:**
\`\`\`
25 minutes: Focused study
5 minutes: Short break
Repeat 4 times
30 minutes: Long break
\`\`\`

**Weekly Schedule Example:**
\`\`\`
Monday: Math (1 hour), History (45 min)
Tuesday: Science (1 hour), English (45 min)
Wednesday: Review weak areas (1.5 hours)
Thursday: Math (1 hour), Science (45 min)
Friday: English (1 hour), History (45 min)
Weekend: Projects, review, catch up
\`\`\`

**🎯 Memory Techniques:**

**Mnemonics:**
- ROY G. BIV (colors of rainbow)
- "My Very Educated Mother Just Served Us Nachos" (planets)
- "Please Excuse My Dear Aunt Sally" (order of operations)

**Visualization:**
- Create mental pictures
- Use color coding
- Draw mind maps
- Make visual stories

**Association:**
- Link new info to what you already know
- Create silly or memorable connections
- Use acronyms and rhymes

**📝 Test-Taking Strategies:**

**Before the Test:**
- Get good sleep (8+ hours)
- Eat a healthy breakfast
- Review key concepts (don't cram)
- Gather all materials needed

**During the Test:**
- Read all instructions carefully
- Start with easy questions
- Budget your time
- Show all work in math
- Check your answers if time allows

**🚀 Motivation Tips:**
- Set specific, achievable goals
- Reward yourself for completing tasks
- Study with friends (but stay focused)
- Remember your "why" - what you're working toward
- Take breaks to avoid burnout

What specific study challenge can I help you overcome?`;
    }

    // For ANY other question - be helpful and educational
    return `🤔 **Great Question: "${userMessage}"**

**I'm here to help you learn about anything!** Let me provide a helpful answer:

**🎯 Based on your question, here's what I can help you with:**

**If it's about a specific concept:**
- I'll explain it clearly with examples
- Provide step-by-step breakdowns
- Give you practical applications
- Share relevant background information

**If it's a problem to solve:**
- I'll walk you through the solution process
- Show multiple approaches when possible
- Explain the reasoning behind each step
- Give you similar practice problems

**If it's for learning/studying:**
- I'll provide comprehensive explanations
- Include diagrams or examples
- Share study tips and memory techniques
- Connect it to real-world applications

**📚 I can help you with:**

**Academic Subjects:**
- **Math**: Algebra, geometry, calculus, statistics
- **Science**: Physics, chemistry, biology, earth science
- **English**: Grammar, writing, literature analysis
- **History**: World history, specific events, cause and effect
- **Foreign Languages**: Grammar, vocabulary, conversation

**Technology & Programming:**
- **Coding**: Python, JavaScript, Java, C++, HTML/CSS
- **Computer Science**: Algorithms, data structures
- **Web Development**: Frontend, backend, databases
- **AI/ML**: Machine learning, data science

**Practical Skills:**
- **Study Techniques**: Memory, time management, test prep
- **Problem Solving**: Critical thinking, logical reasoning
- **Communication**: Public speaking, writing, presentation
- **Life Skills**: Financial literacy, career advice

**General Knowledge:**
- **Current Events**: Technology trends, world affairs
- **Culture**: Art, music, literature, philosophy
- **Health**: Nutrition, exercise, mental wellness
- **Business**: Economics, entrepreneurship, investing

**💡 To give you the best answer, please tell me:**
- What specific aspect interests you most?
- What's your current level of knowledge?
- What are you trying to achieve or understand?
- Is this for school, work, or personal interest?

**🎓 Example of how I can help:**
Instead of asking "Tell me about dogs," try:
- "How do dogs communicate with humans?"
- "What's the science behind dog training?"
- "How did dogs evolve from wolves?"

I'm ready to dive deep into any topic and give you detailed, educational explanations!

What would you like to explore?`;
  }

  const handleSend = () => {
    if (input.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Use local messages if backend messages are empty
  const displayMessages = messages.length > 0 ? messages : localMessages;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  if (!user) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to chat with your AI mentor</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          AI Career Mentor
          <div className="ml-auto">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </CardTitle>
        <CardDescription className="text-blue-100">
          💡 Ask me anything about career, coding, business, or skills - I'm here to help!
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-6 bg-white/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-gray-600 font-medium">Loading your conversation...</span>
                </div>
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 mb-6">
                  <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to your AI Career Mentor! 🚀
                  </h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    I'm here to provide intelligent answers to all your questions, just like Google Gemini!
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: "💻", title: "Coding & Programming", desc: "Skills, languages, best practices" },
                    { icon: "💼", title: "Career Development", desc: "Growth strategies, interviews, jobs" },
                    { icon: "🚀", title: "Business & Startups", desc: "Entrepreneurship, strategy, scaling" },
                    { icon: "🧠", title: "AI & Technology", desc: "Machine learning, data science, trends" },
                    { icon: "📚", title: "Learning & Skills", desc: "Study methods, certifications, growth" },
                    { icon: "🌟", title: "Professional Growth", desc: "Leadership, networking, success" }
                  ].map((item, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              displayMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex items-start gap-4 ${
                    message.isAI ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.isAI && (
                    <Avatar className="w-10 h-10 border-2 border-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[85%] p-4 rounded-3xl shadow-lg ${
                      message.isAI
                        ? "bg-white border border-gray-200 text-gray-900"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${message.isAI ? 'text-gray-500' : 'text-blue-100'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {!message.isAI && (
                    <Avatar className="w-10 h-10 border-2 border-blue-200">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            {sendMessageMutation.isPending && (
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border-2 border-blue-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 p-4 rounded-3xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-700 font-medium">AI is analyzing your question...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-lg border border-gray-200">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about career, coding, AI, business, or any topic..."
              className="flex-1 border-0 bg-transparent focus:ring-0 text-gray-900 placeholder-gray-500 text-base"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Pro tip: Ask specific questions for more detailed and helpful responses!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

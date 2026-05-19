## 3. Beginner Level Curriculum

> **Target Learner:** Individuals with little to no prior experience using AI tools for professional work
> **Prerequisites:** Basic computer literacy, internet access, curiosity
> **Estimated Duration:** 40-50 hours (self-paced)
> **Learning Goal:** Build foundational competence across prompting, coding, design, SEO, automation, content generation, and AI safety

---

### 3.1 Foundations of AI Tools

**Module Overview**
This module introduces the landscape of Large Language Models (LLMs), the underlying technology that powers modern AI assistants. Learners gain practical familiarity with four major platforms—Claude, ChatGPT, Gemini, and Kimi—understanding each interface's unique strengths rather than treating any single tool as the only option. Research confirms that experienced developers use 2.3 AI tools on average, with over 26% using both Copilot and Claude Code simultaneously [^415^].

**Key Concepts**
- **LLM (Large Language Model):** A neural network trained on vast text corpora that predicts the next token to generate coherent, contextually relevant text. Modern LLMs use transformer architectures with self-attention mechanisms [^531^].
- **Token:** The basic unit of text processing—roughly 0.75 English words or 4 characters. Understanding tokens matters because pricing, context limits, and output length are all measured in tokens.
- **Context Window:** The maximum amount of text (input + output) a model can process in a single conversation. Ranges from 200K tokens (Claude Haiku) to 2M+ (Gemini Pro, Kimi consumer) [^309^][^87^].
- **Inference:** The process of generating a response from a trained model. Key parameters include temperature (creativity vs. determinism) and max_tokens (output length cap).
- **Knowledge Cutoff:** The date after which a model has no training data. All LLMs have this limitation, which is why web search integration matters.
- **System Prompt:** Hidden instructions that shape model behavior for every response in a conversation.

**Platform Deep Dives**

| Feature | Claude (Anthropic) | ChatGPT (OpenAI) | Gemini (Google) | Kimi (Moonshot AI) |
|---------|-------------------|------------------|-----------------|-------------------|
| **Free Tier Artifacts** | Yes (since Feb 2026) [^416^] | Limited | Yes (AI Studio) [^302^] | Yes (6 agent uses) [^206^] |
| **Projects/Workspaces** | Yes (Pro/Team) [^434^] | Yes (Projects) [^368^] | AI Studio + Workspace [^302^] | Agent Swarm |
| **Memory** | 3-layer system [^446^] | Persistent profile [^368^] | Project Memory [^368^] | Context compression |
| **Code Execution** | Artifacts (HTML/React/SVG) [^416^] | Canvas + Code Interpreter [^214^] | Code execution in studio [^310^] | Full coding support |
| **Web Search** | Research mode (Pro+) [^2^] | Built-in browsing | Search grounding [^302^] | DeepSearch [^295^] |
| **Context Window** | Up to 1M tokens [^309^] | 1M (GPT-5.4+) [^150^] | Up to 2M tokens | Up to 2M+ tokens [^87^] |

**Claude Basics.** Claude's interface centres on three beginner-friendly features: **Artifacts**—interactive outputs rendered in a split-pane preview for code, HTML, SVG, and Mermaid diagrams [^416^]; **Projects**—persistent workspaces with uploaded knowledge files and custom instructions [^434^]; and a three-tier model family (Haiku for speed, Sonnet for daily use, Opus for complex reasoning) [^310^]. Artifacts are available on the free tier since February 2026, making Claude an excellent starting point for beginners who want to see code execute visually.

**ChatGPT Basics.** ChatGPT offers **Canvas**, a split-screen collaborative workspace for writing and coding with inline editing shortcuts [^214^]; **Projects** with partitioned memory that isolates context between different workstreams [^368^]; and **Deep Research**, a multi-step research agent that issues sequential web queries and synthesises findings into cited reports [^368^]. The Canvas feature auto-triggers for content exceeding 10 lines and supports coding shortcuts including "add logs," "fix bugs," and "port to language."

**Gemini Basics.** Google AI Studio provides a browser-based workspace with three modes: Chat (prompt testing), Build (vibe coding with React + Tailwind export), and Stream (real-time voice/video) [^302^]. The "Get Code" button bridges experimentation and production in two clicks by exporting any session as Python, JavaScript, or cURL [^301^]. Gemini integrates natively with Google Workspace, embedding "Help me create" directly into Docs, Sheets, and Slides [^306^].

**Kimi Basics.** Kimi distinguishes itself through exceptionally long context processing (2M+ tokens in consumer chat, sufficient for ~1,500 pages of dense academic text) [^87^] and a unique **Agent Swarm** architecture supporting up to 300 parallel sub-agents for complex multi-step tasks [^291^]. The K2.6 model offers a 256K token API context with modified MIT licensing for open-weight deployment [^82^]. Kimi's DeepSearch achieves 92.5% F1 on DeepSearchQA, surpassing GPT-5.4 at 78.6% [^295^].

**Practical Exercises**
1. **Platform Tour (30 min):** Create a free account on Claude, ChatGPT, and Gemini. Ask each the same five questions spanning factual recall, creative writing, code explanation, and data analysis. Document response differences.
2. **Artifact Exploration (45 min):** In Claude, generate an HTML portfolio page, an SVG logo, and a Mermaid flowchart. Export each and view locally.
3. **Canvas Coding (45 min):** In ChatGPT Canvas, write a Python script to calculate compound interest. Use the "add comments" and "fix bugs" shortcuts. Port the code to JavaScript.
4. **AI Studio Build Mode (60 min):** In Google AI Studio, describe a task tracker app in natural language. Iterate through the preview, export the React code, and examine the generated Tailwind CSS.

**Tools Used:** Claude.ai (free tier), ChatGPT (free tier), Google AI Studio, Kimi (free tier)
**Assessment Criteria:** Learners demonstrate navigation of all four interfaces and articulate at least two distinctive strengths per platform.
**Common Mistakes:** Treating one platform as superior for all tasks; ignoring free tier capabilities; not leveraging Artifacts/Canvas for visual feedback.

---

### 3.2 Prompt Engineering Fundamentals

**Module Overview**
Prompt engineering is the skill of crafting inputs that reliably produce desired outputs from LLMs. This module covers foundational techniques backed by research: zero-shot and few-shot prompting, role prompting, chain-of-thought reasoning, structured output formatting, and reusable prompt templates. According to OpenAI's developer guidance, well-structured prompts with specific desired context, outcome, length, format, and style dramatically improve output quality [^283^].

**Key Concepts**
- **Zero-Shot Prompting:** Asking a model to perform a task without providing examples. Works best for straightforward, well-defined tasks.
- **Few-Shot Prompting:** Providing 2-5 examples of desired input-output pairs before the actual task. Research shows this significantly improves formatting consistency and task adherence.
- **Role Prompting / Persona Design:** Assigning a specific identity ("You are a senior UX researcher") that shapes tone, depth, and perspective. The GPT-5.5 prompting guide recommends structuring roles with Personality, Goal, Success Criteria, Constraints, Output format, and Stop rules [^287^].
- **Chain-of-Thought (CoT):** Prompting the model to "think step by step," which improves reasoning accuracy by 15-40% on complex tasks [^366^]. Claude's Extended Thinking tokens explicitly bill this reasoning at output rates [^52^].
- **Structured Output:** Requesting responses in machine-readable formats (JSON, XML, Markdown tables) for downstream processing.
- **Prompt Templates:** Reusable patterns with variable slots, enabling consistent outputs across similar tasks.

**Practical Exercises**
1. **Zero-Shot vs. Few-Shot Comparison (30 min):** Ask an LLM to classify customer feedback as positive, neutral, or negative. First without examples (zero-shot), then provide 3 labeled examples (few-shot). Compare accuracy on 10 test cases.
2. **Role Prompt Design (45 min):** Create three distinct personas (friendly customer support agent, terse technical lead, enthusiastic marketer) for the same task: explaining REST APIs. Evaluate outputs for tone consistency and information completeness.
3. **Chain-of-Thuth Math (30 min):** Present 10 arithmetic word problems to an LLM. First without CoT instructions, then with "explain your reasoning step by step." Measure accuracy improvement.
4. **JSON Output Challenge (45 min):** Prompt an LLM to extract structured data from unstructured recipe text: `{"name": "...", "ingredients": [...], "steps": [...], "prep_time": "..."}`. Iterate until the output passes JSON validation 10/10 times.
5. **Template Library (60 min):** Create 5 reusable prompt templates in a shared document: email rewriter, meeting summariser, bug report formatter, social media post generator, and code explainer. Include variable placeholders like `{{topic}}`, `{{tone}}`, `{{audience}}`.

**XML Meta-Prompting Architecture**
Anthropic's Claude responds exceptionally well to XML-structured prompts with explicit tags providing clear, parseable boundaries [^320^]:
```xml
<role>You are a professional technical writer. Respond concisely.</role>
<context>We are migrating a legacy application to serverless.</context>
<instructions>1. Identify stateful middleware. 2. Rewrite to be stateless.</instructions>
<constraints>Do NOT use deprecated SDK v2 methods.</constraints>
```

**Tools Used:** Claude.ai, ChatGPT, Google AI Studio; Notion or Google Docs for template library
**Assessment Criteria:** Learners demonstrate consistent ability to improve output quality through systematic prompt refinement and produce valid structured outputs.
**Common Mistakes:** Vague instructions ("make it better"); no output format specification; combining conflicting styles; neglecting to iterate.

---

### 3.3 Basic Coding with AI

**Module Overview**
This module introduces Python fundamentals specifically for AI interaction, then teaches learners to use AI as a coding partner—writing, debugging, explaining, and reviewing code. No prior programming experience is assumed. Research shows 90% of developers now use at least one AI tool at work, with 46% of senior developers naming Claude Code "most loved" [^414^].

**Key Concepts**
- **Python Syntax Basics:** Variables, data types (strings, integers, lists, dictionaries), conditionals (`if/else`), loops (`for`/`while`), and functions.
- **AI-Assisted Code Generation:** Using natural language descriptions to generate functional code blocks, then reviewing and adapting them.
- **Code Explanation:** Asking AI to explain what unfamiliar code does—a critical skill for understanding AI-generated output.
- **Debugging with AI:** Sharing error messages and code for AI-assisted troubleshooting.
- **API (Application Programming Interface):** A structured way for programs to communicate. REST APIs use HTTP requests (GET, POST) with JSON responses.
- **API Key Authentication:** How API credentials work, secure storage practices (environment variables, never hardcoding).

**Reading AI-Generated Code Checklist**
| Check | Why It Matters |
|-------|---------------|
| Verify imports | Unused or malicious imports are common |
| Check for hardcoded values | API keys, file paths, magic numbers |
| Test edge cases | AI rarely handles null inputs or empty lists |
| Review error handling | Generated code often lacks try/catch blocks |
| Validate data types | Dynamic languages allow type mismatches |
| Check for off-by-one errors | Common in loop boundaries |

**API Concepts for Beginners**
All major AI platforms expose APIs. Understanding the basic pattern—send a request with authentication, receive a structured response—is foundational:

```python
# Claude API basic call pattern
import anthropic
client = anthropic.Anthropic()  # API key from env var
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain what an API is"}]
)
print(message.content[0].text)
```
[^344^]

**Practical Exercises**
1. **Python Fundamentals (90 min):** Complete a guided Python exercise set: variables, lists, dictionaries, `for` loops, and functions. Use AI to explain concepts that are unclear.
2. **Code Generation Challenge (60 min):** Describe a task to AI ("Create a script that reads a CSV file and prints summary statistics"). Generate the code, run it, identify one bug, and ask AI to fix it.
3. **API Call Exercise (60 min):** Make your first API call to a weather service. Parse the JSON response and extract the temperature. Handle the error case for an invalid city name.
4. **Code Review Simulation (45 min):** Paste a deliberately flawed Python script into an AI assistant. Ask it to identify bugs, security issues, and improvements. Compare its findings with a provided answer key.
5. **Explain Foreign Code (30 min):** Paste a 50-line Python script (downloaded from GitHub) into an AI assistant. Ask it to explain what each section does. Verify the explanation by running the code.

**Tools Used:** Python 3.12+, VS Code, Claude.ai or ChatGPT, a weather API (OpenWeatherMap or similar)
**Assessment Criteria:** Learners successfully write, run, and debug Python scripts with AI assistance; make authenticated API calls; and critically review AI-generated code.
**Common Mistakes:** Blindly trusting AI-generated code; not testing edge cases; hardcoding credentials; ignoring security warnings; failing to verify deprecated API methods.

---

### 3.4 Web Design Basics

**Module Overview**
This module introduces HTML and CSS fundamentals with AI assistance, responsive design principles, user-centred thinking, and accessibility basics. Learners design and build a simple webpage while understanding why structure and accessibility matter for both users and search engines.

**Key Concepts**
- **HTML Structure:** Semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) that give meaning to content beyond visual presentation.
- **CSS Styling:** Selectors, properties, values, the box model, Flexbox, and CSS Grid for layout.
- **Responsive Design:** Using `clamp()`, `min()`, `max()`, and container queries so layouts adapt naturally to any screen size [^466^]. The modern methodology follows an escalation workflow: intrinsic first, container next, media last [^466^].
- **User-Centered Design:** Building for the user's goals, constraints, and context—not personal aesthetic preference.
- **WCAG 2.2 AA:** The current global accessibility benchmark requiring 4.5:1 contrast ratio for body text, keyboard navigability, and screen reader compatibility [^463^].
- **Accessibility Basics:** Alt text for images, proper heading hierarchy (one H1 per page, no skipped levels), ARIA labels where semantic HTML is insufficient.

**Container Queries Example**
```css
.card-container {
  container-type: inline-size;
  container-name: card;
}
@container card (min-width: 400px) {
  .card-header { display: flex; justify-content: space-between; }
}
```
[^466^]

**Practical Exercises**
1. **Semantic HTML Structure (45 min):** Take a purely `div`-based webpage and rewrite it using semantic HTML5 elements. Validate using the W3C Markup Validator.
2. **AI-Assisted CSS Layout (60 min):** Describe a desired layout to an AI assistant ("a responsive card grid with 3 columns on desktop, 2 on tablet, 1 on mobile"). Implement the generated CSS, test across breakpoints, and iterate.
3. **Accessibility Audit (45 min):** Run axe DevTools and WAVE on a provided webpage. Document all WCAG 2.2 AA violations and propose fixes for each.
4. **v0.dev Prototyping (60 min):** Describe a landing page component in v0.dev. Generate, export, and review the code for semantic structure and responsive behaviour.

**Tools Used:** VS Code, Chrome DevTools, v0.dev, axe DevTools browser extension, WAVE, Figma (free tier)
**Assessment Criteria:** Learners produce valid semantic HTML, implement responsive CSS with modern techniques, and identify common accessibility issues.
**Common Mistakes:** Using `div` for everything; skipping heading levels; relying solely on media queries; forgetting alt text; testing only on desktop.

---

### 3.5 App Design Fundamentals

**Module Overview**
This module introduces core principles for designing mobile applications: touch-friendly interfaces, navigation patterns, onboarding flows, and platform-specific considerations for iOS and Android. Research shows that Jetpack Compose is now the default for ~70% of new Android apps, while SwiftUI accounts for ~65% of new iOS apps [^494^].

**Key Concepts**
- **Touch Targets:** Minimum 44×44 points (iOS) or 48×48dp (Android) for tappable elements to ensure comfortable interaction.
- **Navigation Patterns:** Bottom tab bars (3-5 items), hamburger menus (content-heavy apps), gesture navigation (power users), and mixed approaches [^542^].
- **Onboarding Best Practices:** Ask minimal upfront questions, demonstrate value within 30 seconds, delay permissions until needed, and use progressive disclosure [^542^].
- **Typography Baseline:** Body text at 14-16sp with 1.4-1.6 line height; avoid thin weights; maintain 4.5:1 contrast ratio [^542^].
- **iOS vs. Android Differences:** iOS uses bottom tab bars by convention, Human Interface Guidelines emphasise clarity and depth; Android uses Material Design with floating action buttons (FABs) and emphasises elevation/shadow.
- **Cross-Platform Considerations:** Shared business logic via Kotlin Multiplatform (stable since Nov 2023) or React Native; platform-specific UI layers for native feel [^197^].

**Native vs. Cross-Platform Decision Framework**
| Factor | Native | Cross-Platform |
|--------|--------|---------------|
| Performance | Maximum | Near-native for 90% of business apps |
| Initial cost | Higher | 30-40% lower for MVP |
| Time to market | Slower | 30-50% faster |
| Maintenance | Complex (two codebases) | Simpler (one fix, both platforms) |
| Best for | Hardware-intensive apps | MVPs, content apps, business tools [^491^] |

**Practical Exercises**
1. **Navigation Pattern Analysis (45 min):** Download 5 popular apps (2 native iOS, 2 native Android, 1 cross-platform). Document navigation model, touch target sizes, and onboarding flow for each.
2. **Wireframe an Onboarding Flow (60 min):** Design a 3-screen onboarding flow for a habit-tracking app in Figma. Include value proposition, permission request timing, and account creation.
3. **Platform Comparison (30 min):** Compare the same screen (a settings page) between iOS and Android native apps. Document differences in typography, spacing, navigation, and interaction patterns.

**Tools Used:** Figma (free tier), FigJam, an iOS device or simulator, an Android device or emulator
**Assessment Criteria:** Learners identify appropriate navigation patterns, design touch-friendly interfaces, and articulate platform differences.
**Common Mistakes:** Desktop-first thinking on mobile; tap targets too small; requesting all permissions at launch; ignoring platform conventions.

---

### 3.6 SEO Foundations

**Module Overview**
Search Engine Optimisation (SEO) in 2026 requires understanding both traditional ranking factors and emerging AI-driven search dynamics. Generative Engine Optimisation (GEO) has emerged as a parallel discipline focused on making content citable and quotable for AI systems [^545^]. This module covers technical foundations, on-page elements, semantic HTML, and Core Web Vitals.

**Key Concepts**
- **How Search Engines Work (2026):** Crawl → Render → Index → Rank. Googlebot discovers pages through links and sitemaps, renders JavaScript, indexes content, and ranks results using hundreds of signals including relevance, authority, and page experience.
- **On-Page SEO:** Title tags (50-60 characters), meta descriptions (150-160 characters), single H1 per page, logical heading hierarchy, descriptive URLs with hyphens [^572^].
- **Semantic HTML:** Using `<article>`, `<nav>`, `<aside>`, `<header>`, `<footer>` to provide content meaning that search engines can parse [^571^].
- **Core Web Vitals:** Three metrics Google uses for page experience ranking: LCP (Largest Contentful Paint, target <=2.5s), INP (Interaction to Next Paint, target <=200ms), CLS (Cumulative Layout Shift, target <=0.1) [^492^].
- **GEO (Generative Engine Optimisation):** Structuring content as clear, verifiable claims with factual density, structured data, and source chain optimisation for AI citation [^545^].

**Core Web Vitals at a Glance**
| Metric | Measures | Good Threshold | Mobile Pass Rate |
|--------|----------|---------------|-----------------|
| LCP | Loading performance | <= 2.5 seconds | 62% [^492^] |
| INP | Responsiveness | <= 200ms | 77% [^492^] |
| CLS | Visual stability | <= 0.1 | 81% [^492^] |

Only ~48% of mobile websites pass all three Core Web Vitals simultaneously [^489^].

**Structured Data Priority Types**
Pages with valid structured data (FAQ, HowTo, Article) appear 20-30% more often in AI-generated summaries than unstructured pages [^529^].

**Practical Exercises**
1. **On-Page SEO Audit (45 min):** Analyse a webpage's title tag, meta description, H1 usage, heading hierarchy, URL structure, and internal linking. Create a prioritised improvement list.
2. **Semantic HTML Rewrite (45 min):** Rewrite a `div`-heavy page using semantic HTML. Add JSON-LD structured data for Article and FAQPage schemas. Validate with Google Rich Results Test.
3. **Core Web Vitals Measurement (60 min):** Use PageSpeed Insights and Lighthouse to measure a webpage's LCP, INP, and CLS. Identify the LCP element and propose optimisations (image format, preloading, CDN).
4. **GEO Content Optimisation (30 min):** Rewrite a blog paragraph for AI citation: add verifiable statistics, structure around clear claims, and include a FAQ section with schema markup.

**Tools Used:** Google Search Console (free), PageSpeed Insights, Lighthouse, Google Rich Results Test, Screaming Frog (free for 500 URLs)
**Assessment Criteria:** Learners optimise on-page elements, implement structured data, measure Core Web Vitals, and explain the relationship between SEO and GEO.
**Common Mistakes:** Keyword stuffing; duplicate title tags; skipping heading levels; ignoring mobile performance; missing alt text.

---

### 3.7 Automation Basics

**Module Overview**
This module teaches learners to identify automatable tasks and build simple AI-powered workflows using both conversational AI assistants and no-code automation platforms. Research shows that 90% of developers use AI tools, and automation is the fastest-growing applied AI skill [^414^].

**Key Concepts**
- **Automatable Task Identification:** Repetitive, rule-based tasks with clear inputs and outputs are prime candidates: data entry, email sorting, form filling, report generation, social media scheduling.
- **AI-Powered Workflow Automation:** Using Claude, Gemini, or ChatGPT to generate scripts, transform data, and orchestrate multi-step processes through natural language instructions.
- **No-Code Automation:** Platforms like Zapier (8,000+ app integrations, 40,000+ actions) [^358^] and Make (1,000+ integrations) enable visual workflow construction without programming.
- **Trigger-Action Pattern:** All automation follows this structure—when X happens (trigger), do Y (action). Example: "When a new row is added to Google Sheets, send a Slack message."
- **Workspace Automation:** Google Workspace Studio follows a Trigger → Reasoning (Gemini) → Action pattern with built-in connectors for Gmail, Sheets, Docs, and Calendar [^198^].

**No-Code Platform Comparison**
| Feature | Zapier | Make | n8n |
|---------|--------|------|-----|
| Integrations | 8,000+ | 1,000+ | 400+ (extensible) |
| Self-hosting | No | No | Yes (open source) |
| Pricing | Per-task | Per-operation | Free self-hosted |
| Best for | Non-technical | Cost-effective | Technical teams [^274^] |

**Practical Exercises**
1. **Task Audit (30 min):** List 20 tasks performed in a typical work week. Classify each as automatable, partially automatable, or requiring human judgment.
2. **AI Script Generation (60 min):** Ask an AI assistant to write a Python script that renames files in a folder based on a pattern, converts CSV to JSON, or sorts emails by sender domain. Run and verify the script.
3. **Zapier/Make Workflow (90 min):** Build a 3-step automation: Trigger (new form submission) → Process (AI summarises the submission) → Action (save summary to Google Doc + send email notification).
4. **Google Workspace Flow (60 min):** In Workspace Studio, create a flow that triggers on a new Gmail label, uses Gemini to extract action items, and creates Google Tasks entries.

**Tools Used:** Claude.ai or ChatGPT, Zapier (free tier), Make (free tier), Google Workspace Studio, Google Apps Script
**Assessment Criteria:** Learners identify at least 5 automatable tasks in a workflow and successfully build one automated process.
**Common Mistakes:** Automating without documenting; no error handling; ignoring edge cases; creating automation that requires more maintenance than the manual task.

---

### 3.8 Image & Video Generation Basics

**Module Overview**
AI-powered image and video generation has matured into a production-capable workflow. GPT Image 2 achieves ~99% text rendering accuracy across multiple scripts [^332^]; Kling 3.0 offers multi-shot storyboarding at native 4K [^336^]; Veo 3.1 generates synchronised 48kHz audio with lip-sync accuracy under 120ms [^332^]. This module introduces the tools, prompting techniques, and critical commercial considerations.

**Key Concepts**
- **Diffusion Models:** Generate images by iteratively refining random noise into coherent visuals through a reverse denoising process [^536^].
- **Autoregressive Image Generation:** GPT Image 2 uses a hybrid architecture that departs from pure diffusion, enabling near-perfect text rendering [^332^].
- **Prompting for Images:** The six-part structure produces the best results: Artifact type → Exact Text (in quotes) → Layout → Visual System → Important Details → Constraints [^301^].
- **Native Audio in Video:** Veo 3.1 and Kling 3.0 generate synchronised sound effects, ambience, and dialogue in the same call as the video [^319^].
- **IP and Licensing:** The March 2026 U.S. Supreme Court ruling confirmed that pure AI output has no copyright owner under U.S. law; human-authored contributions (editing, arrangement) may qualify [^347^].

**Image Generation Model Comparison**
| Model | Best For | Cost (1024px) | Text Rendering | Commercial |
|-------|----------|--------------|----------------|------------|
| GPT Image 2 | Text-heavy images, UI | $0.006-$0.211 | ~99% [^332^] | Yes (Enterprise) |
| Midjourney V7 | Artistic quality | $10-120/mo | Weak | Yes (paid) |
| FLUX 2 Klein 4B | Self-hosted, Apache 2.0 | $0.014 | Good | Apache 2.0 [^416^] |
| Adobe Firefly | IP indemnification | ~$10/mo | Moderate | + Indemnification [^331^] |

**Video Generation Comparison**
| Model | Cost (10s clip) | Audio | Max Resolution | Unique Feature |
|-------|----------------|-------|---------------|---------------|
| Veo 3.1 | $0.50-$4.00 | Native 48kHz | 4K | Best lip-sync [^332^] |
| Kling 3.0 | ~$2.80 | Native (5 lang) | 4K/60fps | Multi-shot storyboard [^336^] |
| Seedance 2.0 | $2.42-$3.03 | Native (8+ lang) | 1080p | Reference system [^306^] |
| Runway Gen-4 | $3.50-$5.00 | Limited | 4K | Motion Brush [^378^] |

**Practical Exercises**
1. **Structured Image Prompt (45 min):** Write a six-part prompt for a product packaging mockup. Generate at low quality, iterate, then produce at high quality. Document iteration changes.
2. **Character Consistency (60 min):** Use Midjourney V7 Omni Reference (strength 300-400) to generate the same character in 3 different environments. Document consistency quality.
3. **Video with Native Audio (60 min):** Generate a 5-second dialogue scene with Veo 3.1. Evaluate lip-sync accuracy and audio-visual coherence.
4. **Licensing Risk Assessment (30 min):** Compare commercial terms across GPT Image 2, Midjourney, Adobe Firefly, and FLUX 2 Klein 4B. Create a risk matrix for a marketing agency.

**Tools Used:** GPT Image 2 (ChatGPT Plus), Midjourney (Basic plan), Google AI Studio (Veo), Adobe Firefly (free tier)
**Assessment Criteria:** Learners generate images using structured prompting, create short video clips, and make informed licensing decisions.
**Common Mistakes:** Expecting photorealistic people; not quoting text in prompts; ignoring licensing restrictions; failing to iterate at low quality first.

---

### 3.9 Safety & Ethics Fundamentals

**Module Overview**
Safety and ethics are not advanced topics—they are foundational requirements woven into every level of AI usage. This module covers hallucination detection, data privacy, responsible usage, and prompt injection awareness. Research from Anthropic's Constitutional AI 2.0 demonstrates a 40% reduction in harmful outputs through dynamic constitution updates [^447^].

**Key Concepts**
- **Hallucination:** An LLM generating plausible-sounding but factually incorrect or fabricated information. Detection methods: cross-reference with authoritative sources, check citations, verify statistics, be sceptical of specific claims.
- **Data Privacy:** Consumer AI plans allow training data usage by default—users must manually opt out [^83^][^446^]. Enterprise plans typically guarantee "no model training on your data" [^413^]. Conversation data may be retained for up to 5 years for users not opted out [^76^].
- **Responsible AI Usage:** Always verify AI-generated facts before publication or decision-making; be aware of training data biases; disclose AI assistance where appropriate; respect copyright and licensing.
- **Prompt Injection:** An attack where malicious input manipulates an AI system to override its instructions. The #1 risk in the OWASP LLM Top 10 [^426^]. Defence includes input validation, output filtering, and least-privilege access.
- **Defence-in-Depth:** A layered security approach: system prompt hardening, input sanitisation, output validation, context isolation, least privilege, rate limiting, and dual-model validation [^337^][^339^].

**Prompt Injection Defence Pattern**
```python
INJECTION_PATTERNS = [
    r"ignore\\s+(all\\s+)?previous\\s+instructions",
    r"you\\s+are\\s+now\\s+(a|an)\\s+",
    r"reveal\\s+(your|the)\\s+(system\\s+)?prompt",
]
def screen_input(user_input: str) -> bool:
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, user_input, re.IGNORECASE):
            return False  # Suspicious input detected
    return True
```
[^339^]

**Data Privacy by Platform**
| Platform | Training Opt-Out | Enterprise Guarantee | Retention Period |
|----------|-----------------|---------------------|-----------------|
| Claude | Manual toggle [^446^] | "No model training" [^413^] | 5 years (if opted in) [^76^] |
| ChatGPT | Manual toggle [^368^] | Business/Enterprise separate | Undisclosed |
| Gemini | Workspace: no training [^41^] | Admin-controlled | Standard Google policies |
| Kimi | Limited [^308^] | Requires self-hosting | Subject to Chinese data law [^145^] |

**Practical Exercises**
1. **Hallucination Hunt (45 min):** Ask an AI 10 questions requiring specific facts (dates, names, statistics). Verify each answer against Wikipedia or primary sources. Calculate the error rate.
2. **Privacy Settings Audit (30 min):** Navigate to privacy settings on Claude, ChatGPT, and Gemini. Document what data each platform collects, how to opt out of training, and what retention policies apply.
3. **Prompt Injection Lab (45 min):** Attempt 5 different prompt injection techniques on a test AI system (in a safe environment). Document which techniques succeed, which fail, and what defences are in place.
4. **Bias Awareness Exercise (30 min):** Ask an AI to generate descriptions of a "successful entrepreneur" five times. Analyse demographic patterns in the generated descriptions.

**Tools Used:** Claude.ai, ChatGPT, Gemini; web browser for fact-checking
**Assessment Criteria:** Learners identify hallucinations with >80% accuracy; configure privacy settings; explain prompt injection risk; recognise bias patterns.
**Common Mistakes:** Trusting AI citations without verification; ignoring privacy settings; using consumer AI for sensitive data; assuming safety features are foolproof.

---

### 3.10 Beginner Capstone Projects

**Project 1: Build a Personal Website with AI Assistance**

**Brief:** Create a complete personal portfolio website (3-5 pages: Home, About, Projects, Contact) using AI-assisted HTML/CSS generation. The site must be fully responsive, pass WCAG 2.2 AA accessibility checks, include structured data schema, and achieve "Good" scores on all three Core Web Vitals.

**Deliverables:**
- Semantic HTML5 structure with proper heading hierarchy
- Responsive CSS using modern techniques (Flexbox/Grid + container queries)
- JSON-LD structured data for Person schema
- Accessibility audit report (axe DevTools + WAVE scores)
- Core Web Vitals measurement (LCP <2.5s, CLS <0.1)
- AI assistance log documenting which prompts were used and what was manually refined

**Skills Applied:** Modules 3.1, 3.2, 3.3, 3.4, 3.6

---

**Project 2: Create an AI-Powered Automation Workflow**

**Brief:** Identify a repetitive task in your daily work or personal life. Design and implement an AI-powered automation solution that combines (a) an AI assistant for content generation or data transformation, and (b) a no-code automation platform (Zapier, Make, or Google Workspace Studio) for execution. The workflow must include error handling and documentation.

**Deliverables:**
- Task analysis identifying time saved per run and estimated annual impact
- Workflow diagram showing trigger, processing steps, and actions
- Working automation with at least 3 connected steps
- Error handling strategy (what happens when a step fails?)
- Cost analysis comparing manual time vs. automation cost
- Demonstration video or screenshot documentation

**Skills Applied:** Modules 3.1, 3.2, 3.7

---

**Project 3: Generate a Brand Identity Package**

**Brief:** Create a complete brand identity for a fictional small business using AI tools. The package must include: a logo concept (AI-generated image), brand copy (tagline, about paragraph, product description), 3 social media assets (images + captions), and a licensing compliance report. All content must respect platform terms and copyright considerations.

**Deliverables:**
- 3 logo variations with structured prompts documented
- Brand copy suite (tagline, 150-word about, 50-word product description)
- 3 social media post images (1:1 format) with platform-appropriate captions
- Licensing compliance report: which models were used, what commercial rights apply, risk assessment
- Cost breakdown of all AI generations
- Prompt library with 5+ reusable templates for future brand work

**Skills Applied:** Modules 3.1, 3.2, 3.8, 3.9

---

**Assessment Rubric: Beginner Level**

| Criterion | Emerging (1) | Developing (2) | Proficient (3) | Advanced (4) |
|-----------|-------------|---------------|---------------|--------------|
| **AI Tool Selection** | Uses only one AI tool; cannot explain why | Uses 2+ tools but inconsistently | Selects appropriate tool for task with clear rationale | Strategically combines multiple tools for optimal results |
| **Prompt Quality** | Vague, one-sentence prompts; poor outputs | Basic structure; inconsistent results | Structured prompts with role, context, format specified | Templates, iteration logs, optimised for each platform |
| **Code Literacy** | Cannot run code; copies without understanding | Runs code but cannot modify it | Reads, runs, and debugs AI-generated code | Critically evaluates code quality; identifies security issues |
| **Design Awareness** | No consideration of UX/accessibility | Basic layout; some accessibility gaps | Semantic HTML; responsive; WCAG-aware | User-centred design; validated accessibility; mobile-first |
| **SEO/Performance** | No SEO consideration | Basic title/meta only | Structured data + Core Web Vitals measured | Comprehensive SEO strategy; GEO-aware; performance budget |
| **Automation Skill** | No automation attempted | Simple 1-step automation | Multi-step workflow with documentation | Error handling, cost analysis, maintainable design |
| **Content Generation** | Random prompts; ignores licensing | Basic generation; limited awareness | Structured prompting; licensing understood | Multi-tool pipeline; cost-optimised; IP risk assessed |
| **Safety & Ethics** | Unaware of risks | Aware but does not act | Verifies facts; manages privacy settings | Defence-in-depth; bias testing; responsible deployment |
| **Project Completion** | Incomplete deliverables | Complete but unpolished | Complete, polished, documented | Exceeds requirements; reusable; production-ready |
| **Critical Thinking** | Accepts AI outputs uncritically | Questions some outputs | Systematically verifies and iterates | Builds evaluation frameworks; teaches others |

**Grading Scale:**
- **Pass:** 20+ points across all criteria (average Proficient)
- **Merit:** 28+ points (consistent Proficiency with some Advanced)
- **Distinction:** 35+ points (majority Advanced)

**Progression Requirements:**
To advance to the Intermediate Level, learners must achieve a Pass grade on at least 2 of 3 capstone projects, with minimum Proficient scores in Prompt Quality, Safety & Ethics, and Critical Thinking.

---

### Module Tools Summary

| Module | Primary Tools | Supporting Tools | Cost (Free Tier) |
|--------|--------------|-----------------|-----------------|
| 3.1 AI Tool Foundations | Claude.ai, ChatGPT, Google AI Studio, Kimi | Browser | All free tiers available |
| 3.2 Prompt Engineering | Claude.ai, ChatGPT, Google AI Studio | Notion/Google Docs | Free |
| 3.3 Basic Coding | Python 3.12, VS Code | Claude.ai, OpenWeatherMap API | Free |
| 3.4 Web Design | VS Code, Chrome DevTools, v0.dev | axe DevTools, WAVE, Figma | Free |
| 3.5 App Design | Figma, FigJam | iOS/Android simulators | Free |
| 3.6 SEO | Google Search Console, PageSpeed Insights, Lighthouse | Screaming Frog, Rich Results Test | Free |
| 3.7 Automation | Zapier/Make, Google Workspace Studio, Claude.ai | Google Apps Script | Free tiers |
| 3.8 Image/Video | GPT Image 2, Midjourney, Adobe Firefly, Veo/Kling | — | Basic paid tiers recommended |
| 3.9 Safety & Ethics | Claude.ai, ChatGPT, Gemini | Browser for fact-checking | Free |
| 3.10 Capstones | All above | — | ~$20-50/month for image/video tiers |

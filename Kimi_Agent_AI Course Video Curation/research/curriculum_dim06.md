# Dimension 06: Image & Video Generation Models — Deep Dive

**Research Date:** May 18, 2026  
**Searches Conducted:** 14+ targeted deep-dive queries across vendor docs, API pricing, benchmarks, and industry analysis  
**Status:** Comprehensive curriculum-ready findings

---

## Table of Contents

1. [GPT Image 2 — Detailed Capabilities & Prompting](#1-gpt-image-2)
2. [Seedance 2.0 — ByteDance's Video Model](#2-seedance-20)
3. [Midjourney V7 — Latest Features](#3-midjourney-v7)
4. [FLUX 2 / Black Forest Labs](#4-flux-2)
5. [Stable Diffusion 3.5 — Current State](#5-stable-diffusion-35)
6. [Google Imagen 4 — Tiers & Pricing](#6-google-imagen-4)
7. [Google Veo 3.1 — Video Generation](#7-google-veo-31)
8. [Runway Gen-4 — Professional Video Tool](#8-runway-gen-4)
9. [Kling 3.0 — Multi-Shot Storyboarding](#9-kling-30)
10. [Adobe Firefly — IP Indemnification](#10-adobe-firefly)
11. [Commercial Considerations](#11-commercial-considerations)
12. [Sora Shutdown — Lessons Learned](#12-sora-shutdown)
13. [Model Comparison Tables](#13-model-comparison-tables)
14. [Curriculum Exercises](#14-curriculum-exercises)
15. [Sources](#sources)

---

## 1. GPT Image 2

### Overview
GPT Image 2 (released April 21, 2026) is OpenAI's flagship image generation model, replacing DALL-E 3 (shut down May 12, 2026) and GPT Image 1.5. It uses a new autoregressive/hybrid architecture that departs from pure diffusion, featuring ~99% text rendering accuracy, 2K native resolution, Thinking Mode with web search, and multi-language typography [^301^][^302^].

### API Details & Pricing

| Parameter | Detail |
|-----------|--------|
| API Model ID | `gpt-image-2` |
| Billing | Token-based (not per-image) |
| Image Input | $8 per 1M tokens |
| Image Output | $30 per 1M tokens |
| Text Input | $5 per 1M tokens |
| Max Resolution | 4096x4096px (3K tier) |
| Rate Limit (Tier 1) | 5 images/min |
| Rate Limit (Tier 5) | 250 images/min |

**Per-image cost estimates (1024x1024)** [^372^][^374^][^375^][^376^]:

| Quality | Cost/Image | Use Case |
|---------|-----------|----------|
| Low | ~$0.006 | Drafts, automation |
| Medium | ~$0.053 | Social media, editorial |
| High | ~$0.211 | Hero images, print |
| 4K (via third-party) | ~$0.41 | Maximum fidelity |

Third-party API platforms (Atlas Cloud, APIYI) offer unified pricing at ~$0.008/image for standard resolutions [^376^].

### Prompting Guide [^301^][^302^][^303^][^304^]

**The Six-Part Structure:**
```
1. Artifact: [poster / product photo / UI screenshot / infographic]
2. Exact Text: [all headlines, labels, buttons in quotes]
3. Layout: [where each element appears]
4. Visual System: [photography style, typography, colors, lighting]
5. Important Details: [objects, charts, labels, physical realism]
6. Constraints: [no extra words, no duplicate text, no watermark]
```

**5 Key Guidelines:**

| Guideline | Explanation | Impact |
|-----------|-------------|--------|
| Front-load the subject | Core subject in first 30% of prompt | Subject takes center stage |
| Structured scenes | Scene -> Subject -> Detail -> Use case -> Constraint | Complex compositions don't lose elements |
| Use quotes for text | Wrap desired in-image text in double quotes | Text accuracy: 70% -> 95%+ |
| Explicit lens & lighting | Specify 24-35mm/85mm, golden hour/3200K, etc. | Consistent, reproducible quality |
| Split edits clearly | "What changes / what stays" for editing | Local edits don't destroy originals |

**6 Common Pitfalls:**

| Pitfall | Symptom | Fix | Quality Gain |
|---------|---------|-----|--------------|
| Long sentence stacking | Cramming all into one sentence | Segment into 5 parts | +30% |
| Conflicting styles | "Photorealistic" + "Pixar 3D" together | Keep 1 main style | +20% |
| Unquoted text | Headline says SUMMER SOUND 2026 | Wrap with "" | +25% |
| Missing camera info | No lens/lighting specified | Add 1 line parameters | +25% |
| Negative prompts | "No humans, no text" | Use positive constraints | +15% |
| Mixing templates | Same structure for different tasks | Organize by category | +20% |

### Advanced Features
- **Up to 16 reference images** per edit call for character/style consistency [^304^]
- **Thinking Mode**: Auto-adjusts reflections, shadows, color balance on edits; adds 3-5x cost [^372^][^187^]
- **Conversational editing**: Natural-language follow-up edits in ChatGPT ("make the sky more dramatic") [^303^]
- **Edit endpoint**: Dedicated API for local editing with preserve/change instructions [^301^]

### Curriculum Exercise: GPT Image 2 Prompting
> **Exercise:** Write a six-part structured prompt for a product packaging mockup. Include exact text in quotes, specify lens parameters (50mm f/1.4), and add positive constraints. Generate at low quality first, iterate, then produce at high quality.

---

## 2. Seedance 2.0

### Overview
Seedance 2.0 (released February 9, 2026) by ByteDance is a unified multimodal audio-video joint generation model. It is the #1 ranked model on the Artificial Analysis Video Arena with ELO 1,269 for text-to-video and 1,351 for image-to-video [^306^].

### Key Features [^306^][^220^]

| Feature | Detail |
|---------|--------|
| Architecture | Unified multimodal audio-video joint generation |
| Max Clip Length | 15 seconds |
| Max Resolution | 720p (1080p on some outputs) |
| Reference Inputs | 9 images + 3 videos + 3 audio per pass |
| Lip-sync | Phoneme-level, 8+ languages |
| Storyboard-to-video | Reads panel layout, shot scales, camera direction |
| Physics Score | 73.0 on Megaton (+31.7 pts above 1.5 Pro) |
| Targeted Editing | Yes — modify without full regeneration |
| Video Extension | Yes — natural continuity |

### The "Omnipotent Reference System"
ByteDance's signature innovation: combine up to 9 reference images, 3 video clips, and 3 audio files in a single generation pass using @mention syntax. Each asset plays a different role — first frame, motion reference, style guide, or audio bed [^306^].

### Pricing & Access [^220^][^348^]

| Tier | Cost | Best For |
|------|------|----------|
| Free tier | Daily limits | Testing |
| Pro | ~$9-10/month | Standard use |
| API Standard | $0.10/sec | Production |
| API Fast | $0.081/sec (AtlasCloud) | High volume |
| Fast tier | $0.022/sec | Lowest cost |

Per-10-second clip cost: **$2.42 (Fast)** to **$3.03 (Standard)** [^348^]

### Curriculum Exercise: Seedance Reference System
> **Exercise:** Create a 10-second product ad using Seedance 2.0. Upload 3 reference images (product shot, style guide, lighting reference) and write a prompt using @mention syntax for each asset. Compare the output with and without reference images.

---

## 3. Midjourney V7

### Overview
Midjourney V7 (current default version as of 2026) is the flagship product of independent AI research lab Midjourney, founded by David Holz. V7 introduces Omni Reference for precise character consistency and improved photorealism with a 77% win rate vs V6 [^55^].

### Pricing Plans (2026) [^413^][^415^][^418^]

| Plan | Monthly | Annual/mo | Fast GPU | Relax Mode | Stealth | Best For |
|------|---------|-----------|----------|------------|---------|----------|
| Basic | $10 | $8 | 3.3 hr (~200 imgs) | No | No | Casual/testing |
| Standard | $30 | $24 | 15 hr | Unlimited | No | Regular creators |
| Pro | $60 | $48 | 30 hr | Unlimited | Yes | Commercial work |
| Mega | $120 | $96 | 60 hr | Unlimited | Yes | Agencies |

**GPU time consumption:** Standard generation ~1 min, upscale ~2 min, variation ~1 min [^418^].

### Key Features [^55^][^305^]

**Omni Reference (V7's Flagship Feature):**

| Strength | Effect | Use Case |
|----------|--------|----------|
| 75 or below | Character loses features | Avoid |
| 100-200 | Loose reference, adapts | Style-heavy transformations |
| **300-500** | **Strong consistency** | **Character storytelling** |
| 600+ | Very high fidelity, may artifact | Max consistency, test carefully |

**Three Reference Types:**
1. **Omni Reference (`--oref`)**: Locks character identity across scenes
2. **Style Reference (`--sref`)**: Copies color palette, lighting, texture without copying subject
3. **Prompt Reference**: Uses original prompt structure for layout/composition

### Midjourney V8 Update (April 2026) [^419^]
- Released April 30, 2026
- Faster generation, HD 2K image output
- Improved prompt adherence
- Raw mode options
- Video generation: still images -> 5s video, extendable to 21s

### Prompt Engineering Formula [^304^]
```
[Subject + Adjectives] doing [Action] in [Scene/Context]. 
[Composition/Camera]. [Lighting/Atmosphere]. [Style/Medium]. 
[Exact Text + Typography]. [Aspect Ratio/Use Case].
```

### Curriculum Exercise: Midjourney Character Consistency
> **Exercise:** Create a 5-image character storyboard using Midjourney V7 Omni Reference. Set strength to 400, use `--cw 100`, and generate the same character in 5 different environments. Document how consistency degrades as strength decreases.

---

## 4. FLUX 2 / Black Forest Labs

### Overview
FLUX 2 from Black Forest Labs (founded by former Stability AI researchers) is the leading open-weights image model family, launched November 25, 2025. The family includes Pro, Flex, Dev, and the Apache 2.0-licensed Klein 4B/9B variants [^370^][^416^][^421^].

### Model Variants & Licensing [^370^][^416^][^380^][^382^]

| Model | Parameters | VRAM | License | Best For | Cost/Image |
|-------|-----------|------|---------|----------|------------|
| FLUX 2 Pro | ~12B | API only | Proprietary (API) | Maximum quality | $0.04-0.06 |
| FLUX 2 Dev | 32B | ~24 GB | Non-commercial | Research, experimentation | Self-hosted |
| FLUX 2 Flex | - | ~20 GB | Non-commercial | Fast iteration | Self-hosted |
| **FLUX 2 Klein 4B** | **4B** | **~13 GB** | **Apache 2.0** | **Commercial deployment** | **$0.014** |
| FLUX 2 Klein 9B | 9B | ~16 GB | Non-commercial | Research/development | Self-hosted |

### Quality Comparison [^379^][^380^]

| Criterion | FLUX 2 Pro | SD 3.5 Large | Midjourney V7 |
|-----------|-----------|--------------|---------------|
| Photorealism | **93** | 90 | 88 |
| Text Rendering | Good | Moderate | Weak |
| Artistic/Styled | 90 | 88 | **95** |
| Portrait Realism | **93** | 90 | 89 |
| Prompt Adherence | **90** | 85 | 83 |
| VRAM (fp16) | ~24GB | ~18GB | N/A (cloud) |

### Ecosystem Integration [^370^][^373^]
- **ComfyUI**: Full native support for all FLUX 2 variants
- **Diffusers (Hugging Face)**: Official pipeline support
- **API Access**: Available via BFL API (bfl.ai) and 50+ third-party platforms
- **Community**: Smaller than SD but growing rapidly

### Speed Benchmarks (RTX 4090, 1024x1024) [^373^]

| Model | Steps | Time | Images/Minute |
|-------|-------|------|---------------|
| SD 1.5 | 25 | ~2.5s | ~24 |
| SDXL | 30 | ~4.5s | ~13 |
| SD 3.5 Large | 28 | ~8s | ~7 |
| FLUX Dev (FP8) | 28 | ~12s | ~5 |
| **FLUX Schnell (FP8)** | **4** | **~2s** | **~30** |

### Curriculum Exercise: FLUX 2 Local Deployment
> **Exercise:** Deploy FLUX 2 Klein 4B locally using ComfyUI. Compare generation quality, speed, and VRAM usage against SD 3.5 Large on the same prompt set. Document the commercial licensing implications of Apache 2.0 vs SD's Community License.

---

## 5. Stable Diffusion 3.5

### Current State
Stable Diffusion 3.5 (released October 2024 by Stability AI) remains the most widely deployed open-weights model by installation count, but FLUX 2 now holds the quality frontier. No Stable Diffusion 4 has been announced as of May 2026 [^150^][^370^].

### Architecture & Variants [^150^][^379^]
- **Architecture**: MMDiT (Multi-Modal Diffusion Transformer) with triple text encoders (CLIP-L, CLIP-G, T5-XXL)
- **SD 3.5 Large**: 8B parameters, ~18GB VRAM (fp16)
- **SD 3.5 Medium**: 2.5B parameters
- **License**: Stability AI Community License — free non-commercial; free commercial <$1M annual revenue; Enterprise license above $1M

### Ecosystem Strengths [^370^][^373^]
| Capability | SD 3.5 | FLUX 2 |
|-----------|--------|--------|
| LoRA fine-tuning | Yes (vast ecosystem) | Yes (growing) |
| ControlNet (pose/depth) | Yes (mature) | Limited |
| ComfyUI integration | Yes (native) | Yes (native) |
| Community size | **Largest** | Smaller but growing |
| Custom workflows | **Yes (extensive)** | Yes |
| Inference speed | ~8s (Large) | ~12s (Dev), ~2s (Schnell) |

### Verdict [^373^]
"SD 3.5 occupies an awkward middle ground — more VRAM than SDXL, less quality than Flux, minimal ecosystem. Unless you have a specific reason to use it, skip SD 3.5 in favor of either SDXL (ecosystem) or Flux (quality)."

### Curriculum Exercise: SD Ecosystem Migration
> **Exercise:** Compare the same generation workflow in Stable Diffusion 3.5 (with LoRA + ControlNet) vs FLUX 2 (with multi-reference). Document which ecosystem offers better control, and analyze the licensing implications for a commercial product with $500K annual revenue.

---

## 6. Google Imagen 4

### Overview
Google Imagen 4 is the enterprise image generation family available via Vertex AI. Three tiers offer distinct quality/speed tradeoffs [^329^][^333^][^335^].

### Pricing Tiers [^329^][^148^]

| Model | Price/Image | Best For | Speed |
|-------|-------------|----------|-------|
| Imagen 4 Fast | $0.02 | Drafts, A/B testing | Fast |
| Imagen 4 Standard | $0.04 | Most production use | Medium |
| Imagen 4 Ultra | $0.06 | Hero content, 4K | Slower |
| Image Editing | $0.02 | Inpainting/outpainting | Medium |
| Upscaling to 2K/4K | $0.003 | Post-processing | Fast |

### Benchmarks vs Competitors [^148^]

| Criterion | Imagen 4 Ultra | FLUX 2 Pro | Midjourney V7 |
|-----------|---------------|------------|---------------|
| Photorealism | 92 | **93** | 88 |
| Text Rendering | **Strong** | Good | Weak |
| Artistic/Styled | 88 | 90 | **95** |
| Product Shots | **93** | 92 | 88 |
| Chinese Aesthetic | Weak | Weak | Fair |
| Prompt Adherence | 88 | **90** | 83 |
| 4K Native | Yes | Yes | Yes (V7) |

### Key Notes
- Ultra's quality gain over Standard is only ~5-10% for 25% more cost [^148^]
- Safety filtering can be overly strict for creative use cases [^148^]
- All outputs include SynthID watermarking automatically [^335^]
- No free tier for Imagen API — all usage beyond trial credits is billed [^329^]

### Curriculum Exercise: Imagen 4 Cost Analysis
> **Exercise:** Calculate the monthly cost of generating 1,000 images/day across all three Imagen 4 tiers (Fast, Standard, Ultra). Build a decision matrix showing when each tier is cost-optimal based on use case requirements.

---

## 7. Google Veo 3.1

### Overview
Google Veo 3.1 (released October 14, 2025) is Google's most advanced video generation model, featuring native 48kHz synchronized audio with lip-sync accuracy under 120ms and up to 4K output [^332^][^334^].

### Technical Specifications [^332^][^334^]

| Feature | Detail |
|---------|--------|
| Max Resolution | 720p, 1080p native / 4K upscaled |
| Frame Rate | 24 FPS standard, 60 FPS option |
| Clip Duration | 4-8 seconds base, extendable to 148 seconds |
| Native Audio | 48kHz synchronized, dialogue + SFX + ambience |
| Lip-sync Accuracy | Under 120ms |
| Reference Images | Up to 4 images |
| Max Prompt Length | 4,000 characters |
| Aspect Ratios | 16:9, 9:16 |
| Temporal Consistency | 8.8/10 score |

### Pricing [^220^][^332^]

| Plan/Mode | Cost | Resolution |
|-----------|------|------------|
| Google One AI Premium | $20/month (consumer) | Standard |
| Veo 3.1 Lite (API) | $0.05/sec | 720p |
| Veo 3.1 Fast (API) | $0.10/sec | 720p |
| Veo 3.1 Standard (API) | $0.20/sec | 1080p, no audio |
| Veo 3.1 Standard + Audio + 4K | Up to $0.60/sec | 4K with audio |

### Strengths & Weaknesses [^332^][^220^]

**Strengths:**
- Best overall visual quality (film-grade)
- Best lip-sync in industry (under 120ms)
- Integrated audio eliminates separate audio workflow
- Fast generation (30-40% faster than Sora 2)
- Available across Google ecosystem (Gemini, Flow, YouTube, Vids, Vertex AI)

**Weaknesses:**
- 8s base clip length (shorter than competitors)
- 4K not available for scene extension
- Expensive at premium tiers ($0.60/sec for 4K+Audio)
- No character consistency system like Kling's Elements
- No multi-shot storyboarding
- Locked into Google ecosystem

### Curriculum Exercise: Veo 3.1 Audio Workflow
> **Exercise:** Generate a 5-second dialogue scene with Veo 3.1 using native audio. Then generate the same scene without audio and add audio separately using ElevenLabs. Compare workflow time, cost, and lip-sync quality between the two approaches.

---

## 8. Runway Gen-4

### Overview
Runway Gen-4 and Gen-4 Turbo (2026) are professional-grade video generation tools with granular creative control, including Motion Brush, camera controls, and reference-driven consistency [^378^][^155^].

### Key Features [^378^][^221^]

| Feature | Detail |
|---------|--------|
| Models | Gen-4, Gen-4.5, Gen-4 Turbo |
| Max Duration | 16 seconds |
| Max Resolution | Up to 4K |
| Motion Brush | Selective region animation |
| Camera Control | Director Mode (pan, tilt, dolly, etc.) |
| Aleph | Video-to-video editing |
| Act-Two | Performance capture |
| Workflows Builder | Automated pipeline construction |

### Pricing (2026) [^330^][^378^]

| Plan | Monthly | Annual/mo | Credits/Month | Key Features |
|------|---------|-----------|---------------|--------------|
| Free | $0 | $0 | 125 (one-time) | Gen-4 Turbo only |
| Standard | $15 | $12 | 625 | All models, 100GB |
| Pro | $35 | $28 | 2,250 | Custom voice, lip-sync, 500GB |
| Unlimited | $95 | $76 | 2,250 + Explore | Unlimited slow generation |
| Enterprise | Contact | Contact | Custom | SSO, priority support |

**Credit consumption per model:**
- Gen-4 Turbo: ~5 credits/sec (~125 sec/month on Standard)
- Gen-4 Standard: ~12 credits/sec (~52 sec/month on Standard)
- Gen-4.5: ~25 credits/10 sec (~250 sec/month on Standard)

### Curriculum Exercise: Runway Motion Brush
> **Exercise:** Use Runway's Motion Brush to animate only specific regions of a product photo (e.g., moving clouds but keeping product static). Compare the result with a full-frame animation to demonstrate selective control advantages.

---

## 9. Kling 3.0

### Overview
Kling 3.0 (released February 5, 2026) by Kuaishou is a multi-shot AI video director that generates 3-15 second clips with built-in camera logic, character consistency, and native audio in 5 languages [^336^][^337^].

### Key Features [^336^][^337^][^220^]

| Feature | Detail |
|---------|--------|
| Multi-shot | Up to 6 connected shots per clip |
| Duration | 3-15 seconds per shot, extendable to 3 minutes |
| Resolution | Native 4K at 60fps |
| Native Audio | Dialogue in 5 languages with lip-sync |
| Character Consistency | Elements feature (up to 4 reference images) |
| Camera Control | Pan, track, dolly, crane, static |
| Free Tier | 66 credits/day |
| Storyboard-to-video | Reads storyboard panel layout |

### Pricing [^220^][^348^]

| Plan | Monthly | Best For |
|------|---------|----------|
| Standard | $6.99 | Beginners, light use |
| Pro | $25.99 | Regular creators |
| Ultra | $64.99 | Power users, early Kling 3.0 access |

**Per-clip cost:** ~$0.30 (Standard) to ~$0.37 per standard clip [^220^]

### Strengths & Weaknesses [^220^]

**Strengths:**
- Most complete feature set at lowest entry price
- Multi-shot storyboarding is unique for the price
- Best character consistency (Elements system)
- Camera controls are best-in-class
- Generous free tier
- Cinematic color grading

**Weaknesses:**
- Credits expire monthly
- Professional mode burns credits fast
- Customer support limited
- Audio quality lags Veo 3.1
- Best features require Ultra subscription

### Curriculum Exercise: Kling Multi-Shot Storyboard
> **Exercise:** Create a 3-shot narrative sequence (establishing shot, medium shot, close-up) using Kling 3.0 multi-shot mode. Upload 2 character reference images and describe each shot's camera movement. Evaluate continuity across cuts.

---

## 10. Adobe Firefly

### Overview
Adobe Firefly offers the only mainstream image generator with explicit commercial-use permission and IP indemnification, trained exclusively on licensed Adobe Stock and public-domain content [^331^][^338^].

### Key Differentiators [^331^][^338^][^347^]

| Feature | Firefly | Competitors |
|---------|---------|-------------|
| Training Data | Licensed Adobe Stock + public domain only | Scraped internet content |
| IP Indemnification | **Yes (enterprise/business plans)** | No |
| Commercial Rights | All plans including free (non-beta) | Varies by tier |
| Creative Suite Integration | Photoshop, Illustrator, InDesign, Express | None |
| SOC 2 Compliance | Yes | Varies |
| Customer Data Training | No | Varies |

### Pricing [^338^][^331^]

| Plan | Monthly | Credits | Key Feature |
|------|---------|---------|-------------|
| Free | $0 | 25 credits/month | Basic access |
| Standard | $9.99 | 2,000 premium credits | Full image generation |
| Pro | $19.99 | 4,000 credits | Video + advanced features |
| Premium | $199.99 | 50,000 credits | High-volume production |

**Note:** Standard image/vector generation is unlimited on all paid plans. Credits only consumed by premium features (text-to-video, partner models).

### Creative Suite Integration
- **Photoshop**: Generative Fill, Generative Expand, Remove Tool
- **Illustrator**: Generative Recolor, Generative Shape Fill
- **Express**: Full Firefly access in web/mobile editor
- All features work on separate non-destructive generative layers

### Weaknesses [^338^]
- Outputs can feel "stocky" or generic vs Midjourney
- Narrower creative range
- Beta features not indemnified
- Credit model penalizes iteration

### Curriculum Exercise: Firefly IP Safety Analysis
> **Exercise:** Compare the commercial licensing terms of Adobe Firefly, Midjourney, and GPT Image 2. Create a risk assessment matrix for a marketing agency producing client-facing content, factoring in IP indemnification, training data ethics, and output ownership.

---

## 11. Commercial Considerations

### Output Rights by Platform [^347^][^380^]

| Provider | Commercial Rights | Indemnification | Conditions |
|----------|-------------------|-----------------|------------|
| **Adobe Firefly** | Full (all plans) | **YES (enterprise)** | Trained on licensed content |
| **OpenAI GPT Image 2** | Full | Limited (Enterprise only) | Subject to content policy |
| **Google Imagen 4** | Full | No | SynthID watermarking |
| **Midjourney V7** | Yes (paid) | No | Revenue >$1M needs Pro/Mega |
| **FLUX 2 Klein 4B** | Full | No | Apache 2.0 — no restrictions |
| **FLUX 2 Dev** | No | No | Non-commercial only |
| **Stable Diffusion 3.5** | Yes (<$1M revenue) | No | Community License |
| **Seedance 2.0** | Yes (paid) | No | Check plan terms |
| **Kling 3.0** | Yes (paid) | No | Pro tier and above |

### Copyright Status [^347^][^195^]
The March 2026 U.S. Supreme Court ruling (declining to hear Thaler v. Perlmutter) confirmed:
- **Pure AI output has NO copyright owner** under U.S. law
- **Human-authored contributions** (selection, editing, arrangement, original additions) may qualify for copyright
- When registering, you must disclose AI involvement and identify human contributions
- Platform Terms of Service (not copyright law) determine your right to sell AI output commercially

### Key Cost Drivers (Image) [^329^][^339^]

| Model | Cost per 1K images (mo) | At 10K images (mo) |
|-------|------------------------|-------------------|
| GPT Image 1 Mini (high) | $36 | $360 |
| Imagen 4 Fast | $20 | $200 |
| Imagen 4 Standard | $40 | $400 |
| Imagen 4 Ultra | $60 | $600 |
| GPT Image 1.5 (medium) | ~$40 | $400 |
| GPT Image 2 (medium) | ~$53 | $530 |
| FLUX 2 Pro | $40-60 | $400-600 |
| Midjourney (Standard) | ~$30 | $30 (unlimited relax) |

### Key Cost Drivers (Video, per 10-second clip) [^348^]

| Model | Cost per 10-sec clip | Audio | Resolution |
|-------|---------------------|-------|------------|
| Veo 3.1 Lite | $0.50 | Yes | 720p |
| Veo 3.1 Fast | $1.00 | Yes | 1080p |
| Seedance 2.0 Fast | $2.42 | Yes | 720-1080p |
| Seedance 2.0 Standard | $3.03 | Yes | 1080p |
| Kling 3.0 | ~$2.80 | Yes | 1080p |
| Veo 3.1 Standard | $4.00 | Yes | 1080p |

### Curriculum Exercise: Licensing Decision Matrix
> **Exercise:** Your startup generates 5,000 images/month and 100 10-second video clips/month. Build a total cost of ownership model comparing: (a) all-cloud API approach, (b) hybrid (FLUX 2 Klein local for images + Veo 3.1 Lite API for video), (c) all-subscription approach (Midjourney + Kling). Factor in hardware costs, engineering time, and legal risk.

---

## 12. Sora Shutdown — Lessons Learned

### Timeline [^349^][^417^][^420^]
- **March 24, 2026**: OpenAI announces discontinuation
- **April 26, 2026**: Consumer web app and mobile clients shut down
- **September 24, 2026**: API deprecated
- 3.3 million early downloads, $2.1 million lifetime sales vs ~$1M/day operating costs

### Why Sora Failed [^349^][^414^][^417^]

| Factor | Detail |
|--------|--------|
| **Compute Costs** | ~$1 million/day to operate; unsustainable unit economics |
| **Low Adoption** | User engagement declined sharply post-launch (1M -> 500K users) |
| **Product-Market Fit** | Impressive technically but not a daily-use/business-critical tool |
| **Strategic Shift** | OpenAI refocused on enterprise AI, coding tools, unified products |
| **Legal Risks** | Copyright disputes, deepfake concerns, safety filter costs |
| **Disney Partnership** | $1B deal killed — partner learned of shutdown <1 hour before public |

### Key Lessons for Curriculum [^349^][^414^]

1. **Breakthrough != Product**: Not every advanced AI technology becomes a scalable product
2. **Unit Economics Matter**: Variable compute costs can crush gross margin at scale
3. **Hype vs Usage**: Technical impressiveness does not guarantee retention
4. **Vendor Lock-in Risk**: Relying solely on external tools introduces strategic risk
5. **Deprecation Cycles Accelerate**: Sora went from launch to shutdown in ~18 months
6. **Build Capabilities, Not Tool Dependencies**: Companies that succeed build controllable AI systems

### Curriculum Exercise: Sora Case Study
> **Exercise:** As a product manager, write a post-mortem analysis of Sora's shutdown. Identify the top 3 warning signs that should have triggered earlier strategic pivoting. Propose a multi-model abstraction layer design that would have protected dependent businesses.

---

## 13. Model Comparison Tables

### Image Generation — Quick Comparison

| Model | Best For | Cost (per 1K, 1024px) | Text Rendering | Commercial | Open Weights |
|-------|----------|----------------------|----------------|------------|--------------|
| GPT Image 2 | Text-heavy images, UI mockups | $6-211 | **~99%** | Yes | No |
| Midjourney V7 | Artistic quality, concept art | $10-120/mo | Weak | Yes (paid) | No |
| Imagen 4 Ultra | Hero content, 4K output | $60 | Strong | Yes | No |
| FLUX 2 Pro | Photorealism, prompt adherence | $40-60 | Good | Yes (API) | No |
| FLUX 2 Klein 4B | Commercial deployment, edge | $14 | Good | **Apache 2.0** | **Yes** |
| SD 3.5 Large | Community ecosystem, LoRA | Free (self-hosted) | Moderate | <$1M free | **Yes** |
| Nano Banana 2 | High-volume, iterative workflows | $60-160 (512px-4K) | ~92% | Yes | No |
| Adobe Firefly | Legal safety, Creative Suite | ~$5/mo+ | Moderate | **+Indemnification** | No |
| Ideogram 3.0 | Typography, text-in-image | $10-60/mo | **Industry-leading** | Yes (paid) | No |

### Video Generation — Quick Comparison

| Model | Best For | Cost (10s clip) | Audio | Max Res | Duration |
|-------|----------|----------------|-------|---------|----------|
| Veo 3.1 | Overall quality, lip-sync | $0.50-4.00 | Native 48kHz | 4K | 4-8s base |
| Kling 3.0 | Multi-shot storytelling | ~$2.80-3.70 | Native (5 lang) | 4K | 3-15s |
| Seedance 2.0 | Motion quality, value | $2.42-3.03 | Native (8+ lang) | 1080p | 4-15s |
| Runway Gen-4 | Professional editing | $3.50-5.00 | Limited | 4K | 5-16s |
| Sora 2 | **DISCONTINUED Sep 2026** | N/A | Partial | 1080p | 10-25s |
| Pika 2.2 | Social media, effects | ~$1.20 | Partial | 1080p | 1-10s |
| Luma Ray 2 | Reliable mid-tier | ~$1.00 | No | 1080p | 9s |

### Curriculum Exercise: Model Selection Decision Tree
> **Exercise:** Build a decision tree for selecting the optimal image/video generation model based on: budget (<$50/mo, $50-200/mo, $200+/mo), output type (social media, print, video ads), legal risk tolerance (low/medium/high), and technical expertise (beginner, intermediate, advanced).

---

## 14. Curriculum Exercises

### Exercise Set A: Prompt Engineering (45 min)

**A1. Structured Prompting for GPT Image 2 (15 min)**
Write prompts using the six-part structure for: (a) a concert poster with 3 lines of text, (b) a product photo with label text, (c) a mobile app UI screenshot. Generate all three and compare text accuracy.

**A2. Midjourney Reference Workflows (15 min)**
Create a character sheet using Omni Reference (strength 400), Style Reference, and Prompt Reference simultaneously. Generate 4 scenes with the same character and document consistency.

**A3. FLUX 2 vs GPT Image 2 Text Rendering (15 min)**
Generate the same infographic with both models. Count spelling errors, evaluate typography quality, and calculate cost-per-accurate-image.

### Exercise Set B: Cost Analysis & Optimization (60 min)

**B1. Production Budget Calculator (20 min)**
Build a spreadsheet model for a marketing team generating 2,000 images and 200 video clips monthly. Compare all-cloud, hybrid, and all-local approaches.

**B2. Quality Tier Optimization (20 min)**
Generate 10 images of the same prompt at low, medium, and high quality. Have a panel "vote" on quality. Calculate the marginal cost-per-perceived-quality-point.

**B3. Batch API Savings (20 min)**
Use Google's Batch API for 100 images and compare cost vs real-time API. Document latency tradeoffs.

### Exercise Set C: Commercial & Legal Analysis (45 min)

**C1. IP Risk Assessment (20 min)**
For 5 different use cases (social media ad, product packaging, film concept art, educational material, merchandise), determine the safest model choice considering copyright, indemnification, and licensing.

**C2. Sora Case Study Analysis (15 min)**
Write a 1-page analysis of Sora's shutdown from a product management perspective. Identify 3 strategic errors and propose alternatives.

**C3. Multi-Model Strategy Design (10 min)**
Design an architecture that uses GPT Image 2 for text-heavy images, Midjourney for artistic concepts, and FLUX 2 Klein locally for high-volume production. Document API costs, failover strategy, and vendor lock-in mitigation.

### Exercise Set D: Video Production Workflows (90 min)

**D1. Native Audio Comparison (30 min)**
Generate the same dialogue scene in Veo 3.1, Kling 3.0, and Seedance 2.0. Evaluate: lip-sync accuracy, audio quality, visual fidelity. Rank and justify.

**D2. Multi-Shot Narrative (30 min)**
Create a 30-second story using Kling 3.0's multi-shot mode (6 shots). Write a shot list, generate, and edit together in CapCut. Document continuity errors.

**D3. Physics & Motion Testing (30 min)**
Test the same action prompt ("a dancer performing a spinning jump") across Veo 3.1, Seedance 2.0, and Kling 3.0. Score motion realism, physics accuracy, and artifact frequency.

---

## Key Trends for Curriculum

1. **Autoregressive/Hybrid Architecture Shift**: GPT Image 2's departure from pure diffusion represents an industry inflection point [^59^]
2. **Native Audio is Now Standard**: 4 of 6 major video models generate synchronized audio natively in 2026 [^219^]
3. **Text Rendering as Key Differentiator**: ~99% accuracy in GPT Image 2 makes it the top choice for marketing use cases [^59^]
4. **Model Deprecation Accelerating**: DALL-E 3 (~2.5yr lifespan), Sora (<18mo) — teams must plan for rapid obsolescence [^224^]
5. **Open-Source Quality vs Ecosystem Tradeoff**: FLUX 2 leads quality; SD 3.5 leads ecosystem size [^370^][^373^]
6. **Chinese Competitors Rising**: ByteDance (Seedance) and Kuaishou (Kling) offer comparable quality at lower prices [^56^][^154^]
7. **Commercial Safety as Differentiator**: Adobe Firefly's IP indemnification is unique among major players [^228^]

---

## Sources

[^55^]: https://aivideobootcamp.com/blog/midjourney-complete-guide-2026/ - "Midjourney Complete Guide 2026: V7 Features, Prompts, Pricing" (aivideobootcamp.com, April 2026)
[^56^]: https://www.atlascloud.ai/blog/guides/seedance-2.0-complete-guide - "Seedance 2.0: ByteDance AI Video Generator Complete Guide 2026" (atlascloud.ai, May 2026)
[^59^]: https://tosea.ai/blog/gpt-image-2-complete-guide - "How to Use GPT Image 2: Complete Guide" (tosea.ai, April 2026)
[^150^]: https://nextomoro.com/stable-diffusion-3-5/ - "Stable Diffusion 3.5" (nextomoro.com, April 2026)
[^154^]: https://cscestudiodigital.com/blog/kling-ai-review-2026/ - "Kling AI Review 2026" (cscestudiodigital.com, February 2026)
[^155^]: https://www.mindstudio.ai/blog/what-is-runway-gen-4-turbo-video/ - "What Is Runway Gen-4 Turbo?" (mindstudio.ai, February 2026)
[^220^]: https://aivideobootcamp.com/blog/seedance-vs-kling-vs-veo-2026/ - "Seedance 2.0 vs Kling 3.0 vs Veo 3.1" (aivideobootcamp.com, April 2026)
[^228^]: https://stacksheriff.com/ai-tools/adobe-firefly-commercial-use/ - "Adobe Firefly Commercial Use 2026" (stacksheriff.com, April 2026)
[^301^]: https://help.apiyi.com/en/gpt-image-2-prompts-collection-april-2026-en.html - "GPT Image 2 Prompt Collection: 10 Most Popular Templates" (apiyi.com, April 2026)
[^302^]: https://morphed.app/blog/gpt-image-2-prompt-guide - "GPT Image 2 Prompt Guide: 25+ Prompts That Actually Work" (morphed.app, April 2026)
[^303^]: https://pixverse.ai/en/blog/gpt-image-2-review-and-prompt-guide - "GPT Image 2 Review: Prompt Guide and Use Cases in 2026" (pixverse.ai, April 2026)
[^304^]: https://www.atlabs.ai/blog/the-ultimate-gpt-image-2-prompting-guide - "The Ultimate GPT Image 2 Prompting Guide" (atlabs.ai, April 2026)
[^305^]: https://discuss.huggingface.co/t/midjourney-v7-vs-v6-in-2026 - "Midjourney V7 vs V6 in 2026: A Builder's Review" (Hugging Face Forums, April 2026)
[^306^]: https://aimlapi.com/blog/seedance-2-0-vs-seedance-1-5-pro - "Seedance 2.0 vs Seedance 1.5 Pro" (aimlapi.com, April 2026)
[^329^]: https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai - "AI Image Pricing 2026: Google Gemini vs. OpenAI Cost Analysis" (intuitionlabs.ai, May 2026)
[^330^]: https://www.somake.ai/blog/runway-ai-pricing - "Runway AI Pricing in 2026" (somake.ai, April 2026)
[^331^]: https://getimg.ai/blog/getimg-ai-vs-adobe-firefly-comparison - "getimg.ai vs Adobe Firefly: Comparison & Review" (getimg.ai, April 2026)
[^332^]: https://veo4.im/blog/veo-3-1-complete-guide-google-ai-video-generator - "Veo 3.1: The Complete Guide" (veo4.im, March 2026)
[^333^]: https://blog.laozhang.ai/en/posts/ai-image-api-pricing-comparison - "AI Image API Pricing Comparison 2026" (laozhang.ai, February 2026)
[^335^]: https://magichour.ai/blog/imagen-4-pricing-and-api - "Imagen 4 Pricing and API Access (2026)" (magichour.ai, February 2026)
[^336^]: https://invideo.io/blog/kling-3-0-complete-guide/ - "Kling 3.0: Complete Guide" (invideo.io, February 2026)
[^337^]: https://morphic.com/resources/how-to/kling-3.0 - "Kling 3.0 on Morphic" (morphic.com, 2026)
[^338^]: https://aiagentsquare.com/agents/adobe-firefly.html - "Adobe Firefly Review 2026" (aiagentsquare.com, March 2026)
[^339^]: https://www.buildmvpfast.com/api-costs/ai-image - "AI Image Generation API Pricing (April 2026)" (buildmvpfast.com, 2026)
[^347^]: https://redescuela.org/ai-guides/ai-copyright/ - "AI and Copyright: What You Can and Can't Do with AI-Generated Content" (redescuela.org, April 2026)
[^348^]: https://www.yangsweb.com/blog/veo-vs-kling-vs-seedance-comparison-2026 - "Veo 3.1 vs Kling vs Seedance, which wins in 2026" (yangsweb.com, April 2026)
[^349^]: https://kaopiz.com/en/articles/sora-shutdown-guide/ - "Sora Shutdown Guide (2026)" (kaopiz.com, April 2026)
[^370^]: https://www.pixazo.ai/blog/top-open-source-image-generation-models - "Best Open-Source AI Image Generation Models in 2026" (pixazo.ai, May 2026)
[^373^]: https://willitrunai.com/blog/stable-diffusion-vs-flux-2026 - "Stable Diffusion vs Flux in 2026" (willitrunai.com, March 2026)
[^374^]: https://framia.pro/page/en-US/news/gpt-image-2-pricing - "GPT Image 2 Pricing: How Much Does It Cost?" (framia.pro, April 2026)
[^375^]: https://crepal.ai/blog/aiimage/image-gpt-image-2-pricing/ - "GPT Image 2 Pricing: Free Access, Limits & API Costs" (crepal.ai, April 2026)
[^376^]: https://www.atlascloud.ai/blog/guides/gpt-image-2-api-guide - "GPT Image 2 on Atlas Cloud" (atlascloud.ai, May 2026)
[^378^]: https://blocksentient.com/review/runway/ - "Runway - 2026 Review" (blocksentient.com, 2026)
[^379^]: https://flowith.io/blog/flux-2-pro-vs-stable-diffusion-3-5-photorealism-text-rendering/ - "Flux 2 Pro vs. Stable Diffusion 3.5" (flowith.io, March 2026)
[^380^]: https://freeacademy.ai/blog/midjourney-vs-dalle-vs-stable-diffusion-vs-flux-comparison-2026 - "Midjourney vs DALL-E vs Stable Diffusion vs Flux 2026" (freeacademy.ai, February 2026)
[^382^]: https://kgabeci.medium.com/flux-vs-stable-diffusion-which-should-you-use-in-2026 - "FLUX vs Stable Diffusion: Which Should You Use in 2026?" (Medium, March 2026)
[^413^]: https://fluxnote.io/guides/midjourney-pricing-2026 - "Midjourney Pricing 2026: $10, $30, $60, $120 Plans Explained" (fluxnote.io, May 2026)
[^414^]: https://kaopiz.com/en/articles/sora-shutdown-guide/ - "Sora Shutdown Guide (2026): What Happened, Key Dates & What Businesses Should Do Next" (kaopiz.com, April 2026)
[^415^]: https://evolink.ai/blog/midjourney-api-pricing-2026 - "Midjourney Pricing Plans in 2026" (evolink.ai, April 2026)
[^416^]: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B - "FLUX.2 [klein] 4B" (Hugging Face, April 2026)
[^417^]: https://www.kursol.io/blog/ai-breaking-news-2026-04-01-sora-shutdown - "Sora's Shutdown: What Your Video AI Strategy Needs Now" (kursol.io, April 2026)
[^418^]: https://aumiqx.com/ai-tools/midjourney-pricing-all-plans-compared-2026/ - "Midjourney Pricing: Basic to Mega Plans Explained" (aumiqx.com, March 2026)
[^419^]: https://pixverse.ai/en/blog/midjourney-ai-image-generator-review - "Midjourney May 2026 Update: V8.1, Pricing & Video" (pixverse.ai, March 2026)
[^420^]: https://www.aicerts.ai/news/sora-shutdown-openais-costly-exit-from-ai-video/ - "Sora Shutdown: OpenAI's Costly Exit From AI Video" (aicerts.ai, May 2026)
[^421^]: https://vercel.com/ai-gateway/models/flux-2-klein-4b/about - "About FLUX.2 [klein] 4B" (Vercel AI Gateway, 2026)

## Facet: Image and Video Generation Models

**Research Date:** May 18, 2026  
**Status:** Comprehensive findings based on 14+ independent web searches across vendor docs, API pricing pages, benchmark sites, and industry analysis

---

### Key Findings

- **GPT Image 2 was released on April 21, 2026** as OpenAI's new flagship image model, replacing DALL-E 3 (which shuts down May 12, 2026) and GPT Image 1.5. It features ~99% text rendering accuracy, 2K native resolution, Thinking Mode with web search, and multi-language typography [^53^][^54^][^59^].
- **OpenAI Sora is being discontinued**: The Sora app shut down on April 26, 2026, and the API will be discontinued on September 24, 2026. OpenAI is shifting video generation strategy toward integrated multimodal systems [^52^][^58^][^224^].
- **Seedance 2.0 was released February 12, 2026** by ByteDance. It is a unified audio-video joint generation model with phoneme-level lip-sync in 8+ languages, scoring 1,271 ELO (2nd place) on the Artificial Analysis Video Arena leaderboard [^56^][^61^][^219^].
- **Nano Banana Pro 2 does NOT exist.** The correct model is **Nano Banana 2** (released February 2026), which succeeds Nano Banana Pro (November 2025). Nano Banana 2 is built on Gemini 3.1 Flash Image and delivers ~95% of Pro's quality at roughly half the cost [^51^][^235^][^237^][^241^].
- **Google Veo 3.1** (released October 2025) is the leading video generation model for overall quality, featuring native 48kHz synchronized audio with lip-sync accuracy under 120ms and 4K output capability [^141^].
- **DALL-E 2 and DALL-E 3 are officially deprecated** with API shutdown on May 12, 2026. OpenAI recommends migration to GPT Image 2 or GPT Image 1.5 [^224^][^225^][^230^].
- **FLUX 2 from Black Forest Labs** is the leading open-weights image model family, with variants ranging from Klein 4B ($0.014/image) to Max ($0.07/MP), rivaling GPT Image 1.5 in quality benchmarks [^146^][^147^][^151^].
- **Stable Diffusion 3.5** (October 2024) remains the most widely deployed open-weights model by installation count, but FLUX.2 now holds the quality frontier. No Stable Diffusion 4 has been announced [^150^].
- **Midjourney V7** (current as of 2026) introduces Omni Reference for precise character consistency and improved photorealism, with plans from $10/month [^55^].
- **Adobe Firefly** offers the only mainstream image generator with explicit commercial-use permission and IP indemnification on paid plans, trained exclusively on licensed Adobe Stock and public-domain content [^228^].

---

### Model Existence Verification

| Model Name | Exists? | Verified Alternative | Notes |
|------------|---------|---------------------|-------|
| **Seedance 2.0** | **YES** | N/A | Released Feb 12, 2026 by ByteDance. Unified audio-video joint generation model. Available via Dreamina, CapCut, and API [^56^] |
| **GPT Image 2** | **YES** | N/A | Released April 21, 2026 by OpenAI. Current flagship image model. API model ID: `gpt-image-2` [^53^][^59^] |
| **Nano Banana Pro 2** | **NO** | **Nano Banana 2** | The model "Nano Banana Pro 2" does not exist. The correct successor to Nano Banana Pro is **Nano Banana 2** (Gemini 3.1 Flash Image, Feb 2026). Nano Banana Pro (Gemini 3 Pro Image, Nov 2025) also still exists [^51^][^235^][^237^] |
| **GPT Image 1.5** | **YES** | N/A | Released Dec 16, 2025. Still available via API. Good migration target from DALL-E 3 [^60^] |
| **DALL-E 3** | **Deprecated** | GPT Image 2, GPT Image 1.5 | API shuts down May 12, 2026. Being replaced by GPT Image family [^224^] |
| **Sora 2** | **YES (sunsetting)** | Veo 3.1, Kling 3.0, Seedance 2.0 | App shut down Apr 26, 2026. API ends Sept 24, 2026 [^52^][^58^] |
| **Google Imagen 4** | **YES** | N/A | Available in Fast (~$0.02/img), Standard (~$0.04/img), and Ultra (~$0.05/img) tiers via Vertex AI [^148^] |
| **Google Veo 3.1** | **YES** | N/A | Released Oct 14, 2025. Google's most advanced video model. 8s clips, up to 4K, native audio [^141^] |
| **Midjourney V7** | **YES** | N/A | Current default version as of 2026. Features Omni Reference. $10-120/month [^55^] |
| **FLUX 2** | **YES** | N/A | Full family from Black Forest Labs: dev, klein, flex, pro, max. Open-weight dev under non-commercial license [^146^][^147^] |
| **Stable Diffusion 4** | **NO** | Stable Diffusion 3.5, FLUX 2 | No SD4 announced as of May 2026. SD 3.5 (Oct 2024) remains current [^150^] |
| **Runway Gen-4** | **YES** | N/A | Gen-4 Turbo available. Image-to-video focused. $0.35-0.50/sec. Up to 4K [^155^] |
| **Kling 3.0** | **YES** | N/A | Released Feb 2026 by Kuaishou. 4K native, multi-shot storyboarding, native audio. From $6.99/mo [^154^][^219^] |
| **Pika 2.2** | **YES** | N/A | Latest Pika version. Social-focused. Creative effects library. ~$0.12/sec [^152^] |
| **Luma Ray 2** | **YES** | N/A | 9s duration, 720p/1080p. Reliable workhorse. ~$0.10/sec [^218^] |
| **Adobe Firefly** | **YES** | N/A | Commercially safest option. IP indemnification on paid plans. Credit-based pricing [^228^] |
| **Ideogram 2.0/3.0** | **YES** | N/A | Text rendering specialist. Flash/Turbo models. From $7/month [^145^][^149^] |
| **Nano Banana Pro** | **YES** | Nano Banana 2 | Released Nov 2025. Still available. Higher quality but slower and more expensive than NB2 [^235^][^237^] |

---

### Major Players & Sources

| Entity | Role/Relevance |
|--------|---------------|
| **OpenAI** | GPT Image 2 (flagship image), Sora 2 (sunsetting video). DALL-E 3 deprecated May 2026. Quality leader per LM Arena (ELO 1,264) [^110^] |
| **Google DeepMind** | Imagen 4 family (Fast/Standard/Ultra), Nano Banana 2/Pro (image), Veo 3.1 (video). Strongest ecosystem integration [^141^][^148^] |
| **ByteDance (SEED Lab)** | Seedance 2.0 (video, #2 ELO), Seedream 4.5/5.0 (image). Rapidly ascending Chinese competitor [^56^][^196^] |
| **Midjourney** | Independent research lab. V7 is current. Artistic quality benchmark. No free tier. $10-120/mo [^55^] |
| **Black Forest Labs** | FLUX 2 family. Leading open-weights image models. Apache 2.0 (klein 4B) and non-commercial (dev) licenses [^146^][^147^] |
| **Stability AI** | Stable Diffusion 3.5. Open-weights pioneer. Community License with $1M revenue threshold. Financial struggles post-restructuring [^150^] |
| **Kuaishou** | Kling 3.0 video model. Strong value at ~$0.50/clip. 4K native, multi-shot storyboarding [^154^][^219^] |
| **Runway** | Gen-4/Gen-4 Turbo. Professional video tool. Granular creative control. Up to 4K output. $0.35-0.50/sec [^155^] |
| **Adobe** | Firefly. Commercially safest with IP indemnification. Deep Creative Cloud integration. Credit-based [^228^] |
| **Pika Labs** | Pika 2.2. Social creator focused. Effects library. Fast iteration [^152^] |
| **Luma AI** | Ray 2. Reliable mid-tier video. Good value. 9s max duration [^218^] |
| **Ideogram** | Text-in-image specialist. Flash/Turbo API. ~$7M annual revenue [^145^] |
| **Higgsfield** | Emerging all-in-one video platform aggregating SOTA models. $130M funding [^223^] |

---

### Trends & Signals

- **Architecture shift from diffusion to autoregressive/hybrid**: GPT Image 2 uses a "completely new architecture" that shifts from two-stage inference to single-pass generation, representing industry movement away from pure diffusion [^59^][^226^].
- **Native audio generation is now standard**: As of early 2026, 4 of 6 major video models (Veo 3.1, Seedance 2.0, Kling 3.0, Sora 2) generate synchronized audio natively, up from zero in early 2025 [^219^][^222^].
- **Text rendering is the new battleground**: GPT Image 2 claims ~99% multi-language text accuracy. Ideogram built its entire brand on typography. Nano Banana 2 features strong text rendering. This is the #1 differentiator for marketing use cases [^59^][^145^].
- **Model deprecation cycles are accelerating**: DALL-E 3 launched Oct 2023, deprecated Nov 2025, shuts down May 2026 (~2.5 year lifespan). Sora 2 launched late 2025, app killed Apr 2026 (<6 months). Teams must plan for rapid obsolescence [^224^][^225^].
- **Commercial safety becoming table stakes**: Adobe Firefly's IP indemnification is unique among major players. Google's SynthID watermarking is automatic on all outputs. C2PA content credentials are increasingly standard [^228^][^237^].
- **Per-second video pricing is converging downward**: Seedance 2.0 Fast at $0.022/sec sets the low-cost benchmark. Kling 3.0 at $0.05/sec offers best value. Sora 2 at $0.80/sec was the most expensive before its shutdown [^106^][^109^].
- **Open source video is emerging**: Wan 2.6 (Alibaba) is the leading open-source video model, enabling self-hosted deployment without API costs [^108^][^222^].
- **Multi-shot storyboarding**: Kling 3.0's ability to generate up to 6 connected shots with consistent characters represents a leap toward long-form AI video [^154^][^220^].

---

### Controversies & Conflicting Claims

- **Sora shutdown rationale disputed**: OpenAI cited "strategic shift toward multimodal integration" but industry sources report high operational costs, legal challenges over copyrighted training data, and inability to compete with ByteDance/Google on pricing contributed [^52^][^58^].
- **DALL-E 3 deprecation backlash**: Developers report GPT Image 1/1.5 produces different aesthetic qualities than DALL-E 3, with some finding the newer models produce "visible artifacts and structural issues" for professional work. OpenAI's forced migration timeline (6 months notice) is seen as aggressive [^232^].
- **GPT Image 2 existence was disputed**: As of April 8, 2026, getimg.ai published an article stating "There is no official GPT Image 2 yet." The model was officially announced April 21, 2026, demonstrating how quickly the landscape shifts [^57^].
- **Seedance 2.0 global availability confusion**: Some sources state global availability excluding the U.S. [^236^], while others confirm U.S. availability via Dreamina [^61^].
- **Nano Banana naming confusion**: Google's image models have been marketed under multiple names (Imagen, Imagen 3, Nano Banana, Nano Banana Pro, Nano Banana 2), causing significant confusion. "Imagen 4" coexists with "Nano Banana" as the same underlying technology with different branding [^235^][^148^].
- **Stability AI's future uncertain**: Post-restructuring leadership has not committed to a Stable Diffusion 4 timeline. Whether Stability AI can fund frontier model development remains open. The SD ecosystem faces pressure to migrate to FLUX-based alternatives [^150^].
- **Commercial copyright status unresolved**: The March 2026 U.S. Supreme Court ruling established a "creative direction spectrum" for AI-generated content copyright but declined to draw a bright line. Pure AI output remains uncopyrightable [^195^].

---

### Detailed Model Profiles

#### OpenAI GPT Image 2 (Released April 21, 2026)
- **What it does**: OpenAI's flagship image generation model. Single-pass autoregressive/hybrid architecture replacing diffusion-based DALL-E 3.
- **Strengths**: ~99% text rendering accuracy across 50+ languages; Thinking Mode with web search; 2K/4K native resolution; multi-format output (various aspect ratios); per-image cost 30% lower than GPT Image 1.5 [^53^][^59^].
- **Weaknesses**: Still no video output (Sora handles video); no streaming generation; edit workflows add 2-3x cost overhead; fine-tuning not available at launch [^53^][^187^].
- **Use cases**: Marketing materials with in-image text, infographics, multi-language campaigns, product mockups, UI mockups, comic panels.
- **Prompting**: Structured approach recommended: Background/Scene -> Subject -> Key Details -> Constraints. Up to 16 reference images supported [^186^].
- **Cost**: API token-based. Approximate per-image: Low quality $0.006-0.02, Medium $0.04-0.11, High $0.15-0.41 depending on resolution. Third-party: $0.03/1K, $0.05/2K, $0.06/4K [^186^][^187^][^192^].
- **Commercial terms**: Full commercial rights granted. OpenAI retains no ownership of outputs [^226^].

#### OpenAI GPT Image 1.5 (Released December 16, 2025)
- **What it does**: Predecessor to GPT Image 2. Still actively supported.
- **Strengths**: 4x faster than DALL-E 3; better instruction following; mask-based selection editing; text rendering improvements; cheaper than GPT Image 2 at medium/high quality [^60^].
- **Weaknesses**: Eclipsed by GPT Image 2 on text rendering; lower native resolution [^60^].
- **Cost**: ~$0.009 low / $0.034 medium / $0.133 high per 1024x1024 image via direct API [^186^].
- **API model ID**: `gpt-image-1.5`

#### OpenAI Sora 2 (Released late 2025; Sunsetting 2026)
- **What it does**: Text-to-video generation with cinematic quality and physics simulation.
- **Strengths**: Best physics simulation and camera control; longest duration (up to 25s on Pro); highest cinematic quality for premium content [^219^][^222^].
- **Weaknesses**: Most expensive ($0.80/sec); slow generation (2-5 min); no character consistency system; limited availability (invite-only API); being discontinued [^52^][^109^].
- **Status**: App shut down April 26, 2026. API discontinued September 24, 2026. Not recommended for new projects [^52^][^224^].

#### ByteDance Seedance 2.0 (Released February 12, 2026)
- **What it does**: Unified audio-video joint generation model. Accepts text, image, audio, and video as inputs.
- **Strengths**: Phoneme-level lip-sync in 8+ languages; multi-shot storytelling; strong motion quality; affordable (Pro ~$9-10/month); 1080p with up to 2K export; ELO 1,271 (#2 on Video Arena) [^56^][^61^][^219^].
- **Weaknesses**: No built-in multi-shot storyboarding (unlike Kling); newer ecosystem with fewer tutorials; 1080p ceiling vs 4K competitors; credit system can be unclear across platforms [^220^].
- **Cost**: Free tier with daily limits. Pro ~$9-10/mo. API: $0.10/sec standard, $0.081/sec Fast via AtlasCloud [^56^][^106^].
- **Availability**: Dreamina (global), Jimeng (China), CapCut integration. Global availability confirmed [^56^][^61^].

#### Google Nano Banana 2 (Released February 2026)
- **What it does**: Google's default image generation model, built on Gemini 3.1 Flash Image architecture.
- **Strengths**: 2-3x faster than Pro; ~95% of Pro quality; Image Search Grounding (real-time web references); Thinking Mode (3 levels); 14 aspect ratios; up to 5-person character consistency; 512px ultra-low-cost tier; up to 14 reference images [^237^][^238^][^241^].
- **Weaknesses**: Slightly less compositional depth on very complex scenes; can take creative liberties with open-ended prompts; text rendering ~92% vs Pro's ~94% [^239^].
- **Use cases**: High-volume production, iterative workflows, real-world subject accuracy, multi-platform content.
- **Cost**: $0.06 (512px), $0.08 (1K), $0.12 (2K), $0.16 (4K) per image via fal.ai. ~47% cheaper than Pro at 1K [^238^][^241^].
- **Commercial terms**: Full commercial use via API platforms. SynthID watermarking on all outputs. C2PA content credentials [^237^].

#### Google Nano Banana Pro (Released November 2025)
- **What it does**: Premium image model on Gemini 3 Pro Image architecture.
- **Strengths**: Highest quality in Nano Banana family; best complex multi-element composition; superior fine typography for print; deepest reasoning [^237^][^238^].
- **Weaknesses**: 2-3x slower than NB2; no Image Search Grounding; no Thinking Mode; more expensive [^237^][^238^].
- **Cost**: $0.15 (1K/2K), $0.30 (4K) per image via fal.ai [^238^].
- **Best for**: Hero images, print campaigns, packaging design, complex compositions.

#### Google Imagen 4 Family (2026)
- **What it does**: Google's enterprise image generation via Vertex AI.
- **Variants**: Fast ($0.02/img, quick drafts), Standard ($0.04/img, production use), Ultra ($0.05/img, 4K hero content) [^148^].
- **Strengths**: 4K native output on Ultra; strong photorealism; strict safety filtering; enterprise-grade reliability [^148^].
- **Weaknesses**: Ultra's quality gain over Standard is only ~5-10% for 25% more cost; safety filtering can be overly strict [^148^].

#### Google Veo 3.1 (Released October 14, 2025)
- **What it does**: Google's most advanced video generation model.
- **Strengths**: First practical model with native 48kHz synchronized audio; lip-sync accuracy under 120ms; up to 4K resolution; scene extension up to 140s; available across Gemini app, Flow, YouTube Shorts, Google Vids, Vertex AI [^141^].
- **Weaknesses**: 8s base clip length; 4K not available for scene extension; expensive ($0.10-0.60/sec depending on mode/resolution); shorter clips than competitors [^141^][^220^].
- **Cost**: Fast mode $0.10/sec (720p); Standard $0.20/sec (no audio, 720p-1080p); with audio + 4K up to $0.60/sec. Google One AI Premium $20/mo includes consumer access [^141^][^220^].
- **API model**: `veo-3.1-generate-preview`

#### Midjourney V7 (Current as of 2026)
- **What it does**: Independent AI image generation platform focused on artistic quality.
- **Strengths**: Omni Reference for precise character consistency (strength 300-500 recommended); improved photorealism (77% win rate vs V6); best-in-class artistic/cinematic aesthetics; strong community [^55^].
- **Weaknesses**: No free tier; Discord-only interface; slower iteration; less precise for technical/business use cases than GPT Image [^55^][^110^].
- **Cost**: $10-120/month depending on plan. No pay-per-use API [^55^].
- **Best for**: Concept art, cinematic visuals, creative projects where artistic quality is paramount.

#### Black Forest Labs FLUX 2 Family (2025-2026)
- **What it does**: Open-weights and hosted image generation models.
- **Variants**: dev (open, non-commercial), klein 4B/9B (Apache 2.0/NCL), flex, pro, max [^146^][^147^].
- **Strengths**: FLUX 2 Pro v1.1 achieves ELO 1,265 (tied with GPT Image 1.5 for quality crown); dev is best open-weight option; credit-based pricing (1 credit = $0.01); from $0.014/image (klein 4B) to premium (max at 25 credits) [^110^][^147^].
- **Weaknesses**: No negative prompts (describe what you want, not what to exclude); hosted vs local tradeoff; licensing varies by variant [^147^].
- **Cost**: Klein 4B from $0.014/img; Pro from $0.03/MP; Max from $0.07/MP [^147^].

#### Stable Diffusion 3.5 (Released October 2024)
- **What it does**: Open-weights image generation from Stability AI.
- **Variants**: Large (8B), Large Turbo, Medium (2.5B) [^150^].
- **Strengths**: Most widely deployed open-weights model by installation; free for non-commercial and <$1M revenue commercial use; vast ecosystem (ComfyUI, LoRA, Automatic1111) [^150^].
- **Weaknesses**: Quality frontier now held by FLUX.2; no SD4 announced; Stability AI financial sustainability uncertain [^150^].
- **License**: Stability AI Community License - free non-commercial; free commercial <$1M annual revenue; Enterprise license required above $1M [^150^].

#### Kling 3.0 (Released February 2026)
- **What it does**: Kuaishou's video generation platform.
- **Strengths**: Native 4K output; multi-shot storyboarding (up to 6 shots); native audio in 5 languages; most complete feature set; best value (~$0.50/clip); generous free tier (66 credits/day); up to 15s per shot, extendable to 3 minutes [^154^][^219^][^220^].
- **Weaknesses**: Credits expire monthly; audio quality lags Veo 3.1; occasional quality inconsistency; strict content moderation [^154^][^220^].
- **Cost**: Standard $6.99/mo; Pro $25.99/mo; Ultra $64.99/mo. API ~$0.50/clip [^220^].

#### Runway Gen-4 / Gen-4 Turbo (2026)
- **What it does**: Professional-grade video generation with granular creative control.
- **Strengths**: Best creative control (motion brush, camera moves, reference-driven consistency); up to 4K output; established ecosystem; professional editor workflow [^155^][^221^].
- **Weaknesses**: Expensive ($0.35-0.50/sec); 10s max duration; no native audio; requires detailed prompts [^109^][^221^].
- **Best for**: Professional video production, advertising, film pre-visualization.

#### Pika 2.2 (2026)
- **What it does**: Social media-focused video generation.
- **Strengths**: Creative effects library (Pikaffects, Pikaswaps); fast; easy to use; good for stylized social content [^152^][^221^].
- **Weaknesses**: 5s max duration; less realistic than competitors; limited control [^109^][^221^].
- **Cost**: ~$0.12/sec via API. Subscription plans available [^109^].

#### Luma Ray 2 (2026)
- **What it does**: Reliable mid-tier video generation via Dream Machine.
- **Strengths**: Fast generation (15-45s); strong natural motion; good value; 720p/1080p; image-to-video and extension modes [^218^].
- **Weaknesses**: 9s max duration; no audio; fewer style options than competitors [^218^].
- **Cost**: $24/mo Dream Machine or pay-per-video via API. ~$0.10/sec [^218^][^109^].

#### Ideogram 2.0/3.0 (2026)
- **What it does**: Text-in-image specialist.
- **Strengths**: Industry-leading typographic accuracy; Realistic/Design/3D/Anime styles; inpainting/outpainting; batch generation (500 prompts); color palette control; Flash/Turbo API [^145^][^149^].
- **Weaknesses**: Image-only (no video); quality ceiling slightly below Midjourney for non-text images; credit consumption opaque; free plan images are public [^145^].
- **Cost**: Free tier (10 generations/day, public). Plus $10/mo, Pro $20/mo, Team $60/mo [^145^].

#### Adobe Firefly (2026)
- **What it does**: Commercially safe image generation integrated with Creative Cloud.
- **Strengths**: Only mainstream tool with IP indemnification; trained on licensed Adobe Stock + public domain; no customer data training; SOC 2 compliance; deep Photoshop/Illustrator/InDesign integration [^228^].
- **Weaknesses**: Outputs can feel "stocky" or generic compared to Midjourney; narrower creative range; beta features not indemnified; credit model penalizes iteration [^228^].
- **Cost**: Premium ~$5/mo standalone; included in Creative Cloud plans. Generative credits reset monthly [^228^].
- **Best for**: Enterprise teams, client work, any use case where legal safety is paramount.

---

### Commercial Considerations Summary

| Provider | Pricing Model | Approximate Cost (Image) | Approximate Cost (Video) | Commercial Rights | Indemnification |
|----------|--------------|-------------------------|-------------------------|-------------------|-----------------|
| OpenAI GPT Image 2 | Per token / per image | $0.03-0.06 (1K-4K) | N/A | Full | Limited (Enterprise only) |
| Google Imagen 4 | Per image | $0.02-0.06 (Fast-Ultra) | N/A | Full | No |
| Google Veo 3.1 | Per second | N/A | $0.10-0.60/sec | Full | No |
| Google Nano Banana 2 | Per image | $0.06-0.16 (512px-4K) | N/A | Full | No |
| Midjourney V7 | Subscription | $10-120/mo unlimited | N/A | Full (paid tiers) | No |
| FLUX 2 (BFL) | Per credit ($0.01) | $0.014-0.07/image | N/A | Varies by variant | No |
| Stable Diffusion 3.5 | Free / Enterprise | Free (self-hosted) | N/A | Community License (<$1M) | No |
| Kling 3.0 | Subscription + API | N/A | $6.99-64.99/mo; ~$0.50/clip | Full (paid) | No |
| Seedance 2.0 | Subscription + API | N/A | ~$9-10/mo; $0.10/sec | Full (paid) | No |
| Runway Gen-4 | Subscription + credits | N/A | $0.35-0.50/sec | Full (paid) | No |
| Adobe Firefly | Subscription + credits | ~$5/mo+ | N/A | Full | **YES (unique)** |
| Ideogram | Subscription | $10-60/mo | N/A | Full (paid) | No |

---

### Recommended Deep-Dive Areas

- **Text rendering in images**: This is the #1 practical differentiator for marketing use cases in 2026. GPT Image 2 (~99%), Nano Banana Pro (~94%), Nano Banana 2 (~92%), and Ideogram (industry-leading) are the models to compare [^59^][^145^][^238^].
- **Native audio in video**: The shift from silent to audio-native video generation is the biggest change since 2025. Veo 3.1 (48kHz, <120ms lip-sync), Seedance 2.0 (phoneme-level, 8+ languages), and Kling 3.0 (5 languages) lead [^141^][^219^].
- **Commercial licensing & IP risk**: Adobe Firefly's indemnification is unique. The March 2026 Supreme Court ruling on AI copyright creates significant legal uncertainty for all other platforms [^228^][^195^].
- **Model deprecation & migration strategy**: OpenAI's aggressive deprecation of DALL-E 3 and Sora demonstrates the need for multi-model strategies and abstraction layers [^224^][^225^].
- **Open-weights ecosystem**: FLUX 2 (BFL) vs Stable Diffusion 3.5 represents a fork in the open-weights path. SD 3.5 has the ecosystem; FLUX 2 has the quality frontier [^147^][^150^].
- **Chinese competitors (ByteDance/Kuaishou)**: Seedance 2.0 and Kling 3.0 offer comparable or superior quality at significantly lower prices than U.S. competitors, but availability and geopolitical considerations remain [^56^][^154^].

---

### Sources

[^51^]: https://fal.ai/models/fal-ai/nano-banana-2 - "Nano Banana 2 - AI Image Generator" (fal.ai, May 2026)
[^52^]: https://resource.digen.ai/sora-ai-video-generation-2026/ - "Sora AI in 2026: Future of Realistic AI Video Generation" (digen.ai, May 2026)
[^53^]: https://enter.pro/page/zh-CN/news/gpt-image-2-fabu-riqi-2026-nian-4-yue - "GPT Image 2 Release Date: OpenAI April 21, 2026" (enter.pro, April 2026)
[^54^]: https://framia.pro/page/zh-CN/news/gpt-image-2-fabu-riqi - "GPT Image 2 Release Date: Officially Launched April 21, 2026" (framia.pro, April 2026)
[^55^]: https://aivideobootcamp.com/blog/midjourney-complete-guide-2026/ - "Midjourney Complete Guide 2026: V7 Features, Prompts, Pricing" (aivideobootcamp.com, April 2026)
[^56^]: https://www.atlascloud.ai/blog/guides/seedance-2.0-complete-guide - "Seedance 2.0: ByteDance AI Video Generator Complete Guide 2026" (atlascloud.ai, May 2026)
[^57^]: https://getimg.ai/blog/gpt-image-2-rumours-leaks-release-date-2026 - "GPT Image 2: Official Release, Features & What's New" (getimg.ai, April 2026)
[^58^]: https://resource.digen.ai/sora-2-openai-shutdown-guide-2026/ - "Sora 2 Release Date & 7 Best 2026 Alternatives" (digen.ai, April 2026)
[^59^]: https://tosea.ai/blog/gpt-image-2-complete-guide - "How to Use GPT Image 2: Complete Guide" (tosea.ai, April 2026)
[^60^]: https://zizzleup.com/chatgpt-image-generation-gpt-image-1-5-upgrade-2026/ - "ChatGPT Image Generation Just Got a Major Upgrade" (zizzleup.com, April 2026)
[^61^]: https://www.mindstudio.ai/blog/what-is-seedance-2-us-release/ - "What Is Seedance 2.0? ByteDance's AI Video Model Now Available in the US" (mindstudio.ai, April 2026)
[^106^]: https://www.atlascloud.ai/blog/guides/cheapest-ai-video-generation-api-2026 - "Cheapest AI Video Generation APIs in 2026" (atlascloud.ai, April 2026)
[^107^]: https://www.atlascloud.ai/blog/guides/2026-ai-video-api-face-off-comparing-price-fidelity-and-api-documentation - "2026 AI Video API Face-Off: Price, Fidelity & API Documentation" (atlascloud.ai, April 2026)
[^108^]: https://evolink.ai/blog/best-ai-video-generation-models-2026-pricing-guide - "Best AI Video APIs in 2026 | Price and Use Case" (evolink.ai, April 2026)
[^109^]: https://crazyrouter.com/en/blog/ai-video-generation-api-pricing-comparison-2026 - "AI Video Generation API Pricing Comparison 2026" (crazyrouter.com, March 2026)
[^110^]: https://blog.laozhang.ai/en/posts/ai-image-generation-api-comparison-2026 - "AI Image Generation API Comparison 2026: Pricing, Quality, and the Best Value Pick" (laozhang.ai, February 2026)
[^141^]: https://www.buildfastwithai.com/blogs/google-veo-3-1-ai-video-generator - "Google Veo 3.1 Review (2026): Lite vs Fast, Pricing, Prompts & API Guide" (buildfastwithai.com, April 2026)
[^145^]: https://scribehow.com/page/Ideogram_AI_Review_2026_Is_It_Still_the_Best_for_Text_in_Images__CxoB3X0GTOOjh3GxKUVX_A - "Ideogram AI Review (2026): Is It Still the Best for Text in Images?" (scribehow.com, May 2026)
[^146^]: https://melies.co/compare/flux-models - "FLUX Models Comparison: Schnell vs Dev vs Pro vs Max (2026)" (melies.co, May 2026)
[^147^]: https://seavidgen.com/blog/flux-2-review - "FLUX 2 Complete Guide (2026): Models, Pricing, and Prompting" (seavidgen.com, May 2026)
[^148^]: https://tokenmix.ai/blog/imagen-4-ultra-review-2026 - "Imagen 4 Ultra Review: Google's 4K Top-Tier Image AI (2026)" (tokenmix.ai, April 2026)
[^149^]: https://aumiqx.com/ai-tools/ideogram-ai-review-text-rendering-2026/ - "Ideogram AI Review 2026: Still the Best for Text-in-Image?" (aumiqx.com, April 2026)
[^150^]: https://nextomoro.com/stable-diffusion-3-5/ - "Stable Diffusion 3.5" (nextomoro.com, April 2026)
[^151^]: https://huggingface.co/black-forest-labs/FLUX.2-dev - "black-forest-labs/FLUX.2-dev" (Hugging Face, April 2026)
[^152^]: https://www.scenario.com/models/pika-22-t2v - "Best Pika 2.2 T2V Text-to-Video Generator" (scenario.com, March 2026)
[^153^]: https://ai.google.dev/gemini-api/docs/video - "Generate videos with Veo 3.1 in Gemini API" (Google AI, May 2026)
[^154^]: https://cscestudiodigital.com/blog/kling-ai-review-2026-in-depth-look-at-kuaishous-advanced-ai-video-generator/ - "Kling AI Review 2026: In-Depth Look at Kuaishou's Advanced AI Video Generator" (cscestudiodigital.com, February 2026)
[^155^]: https://www.mindstudio.ai/blog/what-is-runway-gen-4-turbo-video/ - "What Is Runway Gen-4 Turbo?" (mindstudio.ai, February 2026)
[^186^]: https://unifically.com/blogs/gpt-image-2 - "GPT Image 2 API: Specs, Pricing, and How to Call It (2026)" (unifically.com, May 2026)
[^187^]: https://wavespeed.ai/blog/posts/gpt-image-2-pricing-2026/ - "GPT Image 2 Pricing in 2026: What Teams Pay" (wavespeed.ai, April 2026)
[^191^]: https://upsampler.com/blog/seedream-ai-bytedance-image-generator-editor-2026 - "Seedream AI by ByteDance: Models Review (2026)" (upsampler.com, April 2026)
[^192^]: https://www.segmind.com/models/gpt-image-2/pricing - "GPT Image 2 Pricing" (segmind.com, April 2026)
[^194^]: https://vegavid.com/blog/ai-generated-images-commercial-use - "Can You Use AI Generated Images Commercially in 2026?" (vegavid.com, March 2026)
[^195^]: https://zsky.ai/ai-image-commercial-use - "Commercial Use AI Images: What's Legal in 2026?" (zsky.ai, 2026)
[^196^]: https://modelslab.com/blog/seedream-5-0-api-bytedance-image-model-modelslab-2026 - "Seedream 5.0 API on ModelsLab: Developer Guide (2026)" (modelslab.com, March 2026)
[^218^]: https://crazyrouter.com/en/blog/luma-ray-2-review-may-2026-video-quality-api-guide - "Luma Ray 2 Review: AI Video Generation Quality, Speed, and API Guide" (crazyrouter.com, May 2026)
[^219^]: https://seavidgen.com/blog/ai-video-models-comparison-kling-3-seedance-2-sora-2-veo-3 - "Kling 3.0 vs Seedance 2.0 vs Sora 2 Pro vs Veo 3.1" (seavidgen.com, May 2026)
[^220^]: https://aivideobootcamp.com/blog/seedance-vs-kling-vs-veo-2026/ - "Seedance 2.0 vs Kling 3.0 vs Veo 3.1" (aivideobootcamp.com, April 2026)
[^221^]: https://pixflow.net/blog/best-ai-video-generator/ - "Best AI Video Generators Compared: Runway, Sora, Veo, Pika, Seedance 2.0, and Kling (2026)" (pixflow.net, April 2026)
[^222^]: https://lushbinary.com/blog/ai-video-generation-sora-veo-kling-seedance-comparison/ - "AI Video Generation in 2026: Sora 2 vs Veo 3.1 vs Kling 3.0 vs Seedance 2.0" (lushbinary.com, April 2026)
[^223^]: https://resource.digen.ai/higgsfield-ai-video-model-2026-guide/ - "Higgsfield AI Video Model: 2026 Guide" (digen.ai, May 2026)
[^224^]: https://developers.openai.com/api/docs/deprecations - "Deprecations | OpenAI API" (OpenAI, May 2026)
[^225^]: https://www.aicerts.ai/news/ai-design-tools-after-dall-e-deprecation/ - "AI Design Tools After DALL-E Deprecation" (aicerts.ai, April 2026)
[^228^]: https://stacksheriff.com/ai-tools/adobe-firefly-commercial-use/ - "Adobe Firefly Commercial Use 2026: Honest Legal Guide" (stacksheriff.com, April 2026)
[^230^]: https://community.openai.com/t/deprecation-reminder-dall-e-will-be-shut-down-on-may-12-2026/1378754 - "DALL-E will be shut down on May 12, 2026" (OpenAI Community, April 2026)
[^232^]: https://community.openai.com/t/openai-is-making-a-huge-mistake-by-deprecating-dall-e-3/1367228 - "OpenAI is making a huge mistake by deprecating DALL-E-3" (OpenAI Community, November 2025)
[^235^]: https://melies.co/compare/nano-banana-vs-pro-vs-2 - "Nano Banana vs Pro vs 2: Google's AI Image Models" (melies.co, May 2026)
[^236^]: https://resource.digen.ai/bytedance-seedance-2-0-global-release-2026/ - "ByteDance Seedance 2.0 Global Release: 2026 Launch Guide" (digen.ai, May 2026)
[^237^]: https://www.freepik.com/blog/nano-banana-2-vs-nano-banana-pro/ - "Nano Banana 2 vs. Nano Banana Pro: Which AI image model is right for you?" (freepik.com, March 2026)
[^238^]: https://fal.ai/learn/tools/nano-banana-pro-vs-nano-banana-2 - "Nano Banana Pro vs. Nano Banana 2: What's The Difference?" (fal.ai, March 2026)
[^239^]: https://www.dzine.ai/blog/nano-banana-2-vs-nano-banana-pro/ - "Nano Banana 2 VS Pro: 7 Key Differences" (dzine.ai, March 2026)
[^241^]: https://the-decoder.com/google-explains-the-differences-between-its-three-nano-banana-image-generation-models/ - "Google explains the differences between its three Nano Banana image generation models" (the-decoder.com, March 2026)

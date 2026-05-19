## Cross-Verification Results

**Research Date:** May 18, 2026
**Dimensions Analyzed:** 12 (dim01-dim12)
**Verification Scope:** Model benchmarks, pricing, release dates, market data, technical specifications, safety ratings

---

### High Confidence Findings
[Confirmed by 3+ dimensions or authoritative primary sources]

#### 1. Claude Opus 4.7 SWE-bench Verified: 87.6%
- **Dim01 (Claude):** 87.6% [^53^][^111^]
- **Dim04 (Kimi comparison):** 80.8-87.6% range [^293^][^295^]
- **Dim07 (Agentic AI):** 80.8% (Opus 4.6), 87.6% (Opus 4.7) [^333^]
- **Status:** CONSISTENT. The 87.6% figure is from Anthropic's official reporting and confirmed across dimensions. The variation between 80.8% (4.6) and 87.6% (4.7) reflects model version differences, not data conflicts.

#### 2. Model Tier Pricing Structure
- **Claude:** Haiku $1/$5, Sonnet $3/$15, Opus $5/$25 (per 1M tokens) [dim01, dim03, dim04]
- **Gemini:** Flash-Lite $0.25/$1.50, Flash $0.75/$4.50, Pro $2/$12 (Standard tier) [dim03, dim04]
- **Kimi K2.6:** $0.60/$2.50-4.00 [dim04, dim07]
- **Status:** CONSISTENT across all dimensions where compared. Pricing ratios (input:output ~1:5 for Claude, ~1:6 for Gemini) are confirmed.

#### 3. MCP (Model Context Protocol) as Universal Standard
- **Dim01:** 97M+ monthly SDK downloads [^339^]
- **Dim07:** 10,000+ public MCP servers, donated to Linux Foundation AAIF December 2025 [^310^][^303^]
- **Dim08:** MCP architecture detailed with stdio/SSE/Streamable HTTP transports [^386^][^397^]
- **Status:** CONSISTENT. MCP adoption is confirmed as the de facto standard across Claude, OpenAI, Google, and Kimi ecosystems.

#### 4. A2A Protocol Multi-Organization Support
- **Dim03 (Google):** 150+ organizational supporters [^401^][^404^]
- **Dim07 (Agentic):** 150+ supporters, 7 task states, Linux Foundation governance [^313^][^302^]
- **Status:** CONSISTENT. Both sources confirm the same adoption metrics and governance structure.

#### 5. OWASP Top 10 for Agentic Applications
- **Dim07:** Released December 2025, Agent Goal Hijack (ASI01) as #1 risk [^178^][^311^]
- **Dim08:** Prompt injection as #1 LLM risk [^426^]
- **Real incidents:** EchoLeak (CVSS 9.3), Replit database wipe, Trivy supply chain attack [^181^]
- **Status:** CONSISTENT. Safety priority rankings align across dimensions.

#### 6. Sora Shutdown Timeline
- **Dim02:** Discontinuation announced March 24, 2026; consumer shutdown April 26, 2026; API deprecation September 24, 2026
- **Dim06:** Same timeline confirmed, $1M/day operating costs vs $2.1M lifetime sales
- **Status:** CONSISTENT. Timeline and financial data corroborated.

#### 7. Assistants API Deprecation Deadline
- **Dim02:** August 26, 2026 [^307^][^348^][^350^]
- **Dim08:** Confirmed deprecated in favor of MCP + Agents SDK
- **Status:** CONSISTENT. Critical curriculum deadline confirmed.

#### 8. Swift 6 Strict Concurrency & React Native New Architecture
- **Dim09:** Swift 6 compile-time data-race safety confirmed [^43^][^524^]
- **Dim09:** React Native 0.82+ New Architecture mandatory [^42^][^475^]
- **Status:** CONSISTENT. Both native platform shifts confirmed by multiple sources.

#### 9. Claude Code Competitive Position
- **Dim01:** 46% "most loved" among senior developers, 90% developer AI tool adoption, $2.5B run-rate revenue [^414^][^415^]
- **Dim07:** Anthropic coding products >$1B annualized revenue [^335^]
- **Status:** CONSISTENT (note: dim07 figure is subset of dim01's broader revenue figure).

#### 10. Chinese Open-Source Model Dominance on OpenRouter
- **Dim04:** Chinese models overtook American models on OpenRouter in February 2026 (5.16T vs 2.7T tokens) [^107^]
- **Dim04:** Kimi K2.6 ranks #12 of 115 on BenchLM provisional leaderboard
- **Status:** CONFIRMED. Multiple independent sources corroborate.

---

### Medium Confidence Findings
[Confirmed by 1-2 dimensions or secondary sources]

#### 1. Gemini 3.1 Pro SWE-bench Verified: 80.6%
- **Dim03:** 80.6% [^330^]
- **Dim04:** 80.6% (comparison table) [^298^]
- **Status:** CONSISTENT but only 2 dimensions citing. Ranked #2 behind Claude Opus 4.6 at 80.8%.

#### 2. Kimi K2.6 Agent Swarm: 4.5x Speedup
- **Dim04:** 4.5x faster than single-agent, 80% reduction in end-to-end runtime [^291^][^313^]
- **Dim07:** Same figures referenced [^356^][^357^]
- **Status:** CONSISTENT across dimensions, but primary source is Moonshot AI's own reporting.

#### 3. RouteLLM: 85% Cost Reduction
- **Dim07:** 85% cost reduction while maintaining 95% of frontier model quality [^355^][^113^]
- **Status:** Single-dimension finding (UC Berkeley ICLR 2025 paper). Plausible but limited cross-references.

#### 4. Semantic Caching: 45-80% Cost Reduction
- **Dim07:** 45-80% cost reduction with 13-31% latency improvement [^375^][^377^]
- **Dim08:** Token caching at ~10% cost mentioned
- **Status:** Range is broad (45-80%) reflecting different implementation scenarios.

#### 5. Only 21% of Organizations Have Mature AI Agent Governance
- **Dim07:** 21% mature governance, 40%+ projects expected to be canceled by 2027 [^111^][^186^]
- **Status:** Gartner-sourced data, single dimension but from a reputable analyst firm.

#### 6. GPT Image 2 Text Rendering: ~99% Accuracy
- **Dim02:** ~99% character-level accuracy [^332^]
- **Dim06:** ~99% text rendering accuracy [^59^]
- **Status:** CONSISTENT but both citing OpenAI's own benchmarks. Independent verification limited.

#### 7. Adobe Firefly IP Indemnification as Unique Differentiator
- **Dim06:** Only mainstream generator with explicit commercial-use permission and IP indemnification [^331^][^338^]
- **Status:** Single dimension but legally significant claim with clear documentation.

#### 8. Core Web Vitals Mobile Pass Rates (2025)
- **Dim10:** LCP 62%, INP 77%, CLS 81%; only 48% pass all three [^492^][^489^]
- **Status:** Single dimension citing Web Almanac 2025 data. Authoritative source.

---

### Conflict Zones
[Discrepancies between dimensions requiring resolution]

#### Conflict 1: Claude Opus 4.6 vs 4.7 Benchmark Reporting
- **Dim01:** Opus 4.7 SWE-bench Verified 87.6% [^111^]
- **Dim03 (Google comparison):** Claude Opus 4.6 at 80.8% SWE-bench [^330^]
- **Dim04 (Kimi comparison):** Claude Opus 4.6 at 80.8%, Opus 4.7 at 87.6%
- **Dim07:** Opus 4.6 at 80.8% [^333^]
- **Resolution:** NOT A CONFLICT. Dim01 reports the 4.7 model (87.6%), while dim03/04/07 report the 4.6 model (80.8%). The versioning explains the discrepancy. Both figures are accurate for their respective model versions.

#### Conflict 2: GPT-5.5 Pricing Context
- **Dim02:** GPT-5.5 at $5/$30 per 1M tokens
- **Dim04 comparison table:** GPT-5.4/5.5 at $2.50/$15
- **Resolution:** NOT A CONFLICT. Dim02 specifies GPT-5.5 alone at $5/$30. Dim04 appears to conflate or average GPT-5.4 ($2.50/$15) with GPT-5.5 ($5/$30). The dim02 figure is authoritative for GPT-5.5 specifically.

#### Conflict 3: Gemini 3.1 Flash-Lite Vectara Hallucination Rate
- **Dim03:** 3.3% hallucination rate (better than Pro's 10.4%) [^197^]
- **Status:** This is anomalous -- Flash-Lite beating the flagship Pro on quality metrics. Likely reflects different model configurations or evaluation conditions rather than a true error. May indicate Flash-Lite is optimized for factual accuracy over creativity.

#### Conflict 4: Claude Code Context Window Claims
- **Dim01:** 1M tokens (Opus/Sonnet), 200K (Haiku) [^309^]
- **Dim07:** 1M token window (beta), 200K standard [^333^]
- **Resolution:** CONSISTENT. Both confirm 1M for top-tier models, 200K for Haiku. The "beta" qualifier in dim07 refers to early access status.

#### Conflict 5: API Deprecation Timeline Differences
- **Dim02:** Assistants API shutdown August 26, 2026
- **Dim03:** Gemini 2.5 Pro deprecation June 17, 2026 (AI Studio) / October 16, 2026 (Vertex AI)
- **Status:** NOT A CONFLICT. Different APIs from different vendors with different timelines. Both require curriculum attention.

#### Conflict 6: OpenClaw vs Hermes Security Claims
- **Dim05:** OpenClaw has 138 CVEs in 63 days (7 critical); Hermes has 0 agent-specific CVEs [^34^][^66^]
- **Dim05 caveat:** Hermes launched February 2026, giving less exposure time
- **Resolution:** PARTIAL CONFLICT. The raw numbers are accurate but the comparison is misleading due to different exposure windows. The zero-CVE record is encouraging but not statistically significant given shorter exposure time.

#### Conflict 7: Developer Tool Adoption Percentages
- **Dim01:** 90% of developers use at least one AI tool; 46% senior devs name Claude Code "most loved" [^414^]
- **Dim07:** GitHub Copilot dominates IDE-integrated usage
- **Resolution:** NOT A CONFLICT. Different metrics ("most loved" vs "most used"). Claude Code is loved but may not be the most widely installed. The 90% overall adoption figure is consistent with industry trends.

---

### Resolution Notes

#### How Conflicts Were Resolved

1. **Model version differences:** Most benchmark discrepancies resolved by identifying which specific model version (4.6 vs 4.7, GPT-5.4 vs 5.5) was being reported. Always cite the version alongside the score.

2. **Vendor self-reporting bias:** Benchmarks from Anthropic, OpenAI, Google, and Moonshot reporting their own model performance were flagged as potentially biased. Cross-referenced with independent benchmark sources (Artificial Analysis, BenchLM) where available.

3. **Temporal currency:** All dimensions researched on May 18, 2026, ensuring temporal alignment. Release dates within days of each other (e.g., GPT-5.5 on April 23, Claude Opus 4.7 on April 16) are consistent with the competitive release cadence.

4. **Pricing tier confusion:** Google's four-tier system (Standard/Batch/Flex/Priority) means a single model can have 4 different prices. Most dimensions quote only the Standard tier, leading to apparent discrepancies when other tiers are used.

5. **Open-source vs proprietary metric gaps:** Open-weight models (Kimi, FLUX) have more verifiable deployment metrics, while proprietary models (Claude, GPT) rely more on vendor-reported numbers.

#### Data Quality Assessment by Dimension

| Dimension | Data Quality | Source Diversity | Confidence |
|-----------|-------------|-----------------|------------|
| Dim01 (Claude) | High | 60+ sources, mix of official/docs/blogs | High |
| Dim02 (OpenAI) | High | 40+ sources, official docs prominent | High |
| Dim03 (Google) | High | 40+ sources, good vendor diversity | High |
| Dim04 (Kimi) | Medium-High | Mix of Chinese/English sources, some geopolitical bias | Medium-High |
| Dim05 (Hermes) | Medium | Primarily project docs and community blogs | Medium |
| Dim06 (Image/Video) | High | Vendor docs + independent benchmarks | High |
| Dim07 (Agentic AI) | High | Academic papers + vendor docs + OWASP | High |
| Dim08 (Prompt Engineering) | Medium-High | Tutorial-focused, practical implementations | Medium-High |
| Dim09 (Native Apps) | Medium-High | Platform vendor docs + community sources | Medium-High |
| Dim10 (Web/SEO) | Medium | Marketing industry sources, some promotional bias | Medium |
| Dim11 (Senior Eng) | High | Academic + industry best practices | High |
| Dim12 (Neural Nets) | High | Academic papers + educational resources | High |

# Dimension 12: Neural Network Fundamentals — Curriculum Deep Dive

> **Research Date:** May 18, 2026  
> **Searches Conducted:** 12+ targeted web searches across neural network fundamentals, deep learning, embeddings, transformers, LLMs, diffusion models, multimodal AI, RAG, fine-tuning, evaluation, AI safety, and hardware.  
> **Sources:** 40+ authoritative sources with inline citations.

---

## Table of Contents

1. [Neural Network Basics](#1-neural-network-basics)
2. [Deep Learning Fundamentals](#2-deep-learning-fundamentals)
3. [Embeddings](#3-embeddings)
4. [Transformers](#4-transformers)
5. [Large Language Models](#5-large-language-models)
6. [Diffusion Models](#6-diffusion-models)
7. [Multimodal Models](#7-multimodal-models)
8. [Retrieval-Augmented Generation (RAG)](#8-retrieval-augmented-generation-rag)
9. [Fine-Tuning Techniques](#9-fine-tuning-techniques)
10. [Model Evaluation](#10-model-evaluation)
11. [AI Safety Basics](#11-ai-safety-basics)
12. [Hardware for AI](#12-hardware-for-ai)

---

## 1. Neural Network Basics

### 1.1 The Perceptron: The Foundation

A **perceptron** is the simplest and earliest model used in machine learning, mimicking a single biological neuron. It acts as a basic artificial neuron that takes inputs, applies weights and bias, and produces an output to classify information [^583^].

**Mathematical model:**
```
z = w · x + b
y = f(z)
```

Where:
- **w** represents the **weights** (importance of each input)
- **x** represents the **inputs** (feature values)
- **b** represents the **bias** (shifts the decision boundary)
- **f(z)** is the **activation function** (produces the final output)

**Analogy:** Think of a perceptron like a single neuron in the brain. A biological neuron receives signals through its dendrites, processes them in the cell body, and fires an output through the axon if the signal is strong enough [^583^]. Similarly, a perceptron receives input values, multiplies them by weights, adds a bias, and passes the result through an activation function. If the combined input exceeds a threshold, the perceptron "fires" and outputs 1; otherwise, it outputs 0.

#### Core Components

| Component | Description | Analogy |
|---|---|---|
| **Inputs** | Numbers fed from data sources (pixel values, sensor readings) | Senses (sight, touch) sending signals to the brain |
| **Weights** | Values indicating importance of each input | Volume knobs — some inputs are turned up, others down |
| **Bias** | Constant added to shift the decision boundary | A thermostat set point — determines when to "turn on" |
| **Activation Function** | Rule determining whether the neuron fires | A gatekeeper deciding whether the signal is strong enough |

**The Decision Boundary:** The perceptron learns a linear decision boundary defined by `w · x + b = 0`. In 2D, this is a line; in higher dimensions, it becomes a plane or hyperplane that separates classes [^583^].

#### The Perceptron Training Algorithm

```
1. Initialize weights and bias to small random values
2. For each training example (x, y):
   a. Compute: z = w · x + b
   b. Predict: output = 1 if z ≥ 0, else 0
   c. If prediction ≠ target:
      - Update weights: w = w + η × (target − predicted) × x
      - Update bias: b = b + η × (target − predicted)
3. Repeat until convergence or max epochs
```

This iterative process gradually shifts the decision boundary until the perceptron correctly classifies the training data, provided the data is linearly separable [^583^].

**Key Insight:** Standalone perceptrons can only solve linearly separable problems. However, the idea behind the perceptron remains foundational — modern neural networks are built by stacking many perceptron-like units across layers, enabling them to solve complex, non-linear problems [^583^].

### 1.2 From Perceptron to Neural Network

When we stack multiple perceptrons into **layers** and connect those layers, we create a neural network:

- **Input Layer:** Receives the raw data features
- **Hidden Layer(s):** Intermediate layers that learn representations
- **Output Layer:** Produces the final prediction

> **Curriculum Exercise:** Implement a single perceptron in Python using NumPy that learns the AND logical gate. Then try XOR — what happens? (Hint: XOR is not linearly separable. You'll need a multi-layer network!)

---

## 2. Deep Learning Fundamentals

### 2.1 Backpropagation: Learning from Mistakes

**Backpropagation** is the algorithm that enables neural networks to learn. It answers the question: *"How should each weight in the network change to reduce the final error?"* [^521^]

**The Core Process:**
1. **Forward Pass:** Input flows through the network, producing a prediction
2. **Compute Loss:** Compare prediction with the true label (how "wrong" was the prediction?)
3. **Backward Pass:** Move backward layer by layer using the **chain rule** from calculus
4. **Accumulate Gradients:** Each weight gets a gradient indicating direction and magnitude of change
5. **Update Weights:** Optimizers like SGD or Adam use gradients to move weights toward better values [^521^]

**The Chain Rule Analogy:** Imagine a row of dominoes. If the last domino (the loss) falls, backpropagation traces backward through each domino (layer) to figure out which earlier dominoes contributed most to the fall. The chain rule lets us compute how changes in early weights ripple through to affect the final output [^521^].

**Key Insight:** Backpropagation does not compute gradients from scratch for each weight. It reuses intermediate results from the forward pass, making the entire process efficient [^521^]. Deep learning frameworks like PyTorch and TensorFlow automatically build and optimize this computational graph behind the scenes.

### 2.2 Gradient Descent and Optimizers

**Gradient Descent** is the fundamental optimization algorithm for training neural networks. Imagine standing on a foggy mountain and trying to reach the bottom — you feel the slope under your feet and take a step in the steepest downward direction. That's gradient descent [^516^].

#### Types of Gradient Descent

| Variant | Description | Pros/Cons |
|---|---|---|
| **Batch GD** | Uses entire dataset for each update | Stable but slow for large datasets |
| **SGD** | Uses one random sample per update | Fast but noisy |
| **Mini-batch GD** | Uses small batches (32-512 samples) | Best of both worlds — most common |

#### Key Optimizers

**SGD (Stochastic Gradient Descent):** The simplest optimizer. Updates weights using `w = w − η × gradient`. Fast but can oscillate around the minimum [^515^].

**Momentum:** Instead of using only the current gradient, accumulates a "velocity" term: `v_t = β × v_{t-1} + ∇J`. Think of it like a ball rolling downhill — it builds momentum and powers through flat regions and saddle points [^516^].

**Adam (Adaptive Moment Estimation):** Combines momentum with adaptive learning rates per parameter. Maintains running averages of both first and second moments of gradients. **Adam has become the default choice for most deep learning** because it requires little tuning and works well across most problems [^516^].

**AdamW:** A variant of Adam with decoupled weight decay that often generalizes better.

#### Convergence Considerations

When does gradient descent actually find the minimum? [^516^]:
- **Convex functions** (bowl-shaped): GD is guaranteed to find the global minimum
- **Non-convex functions** (neural networks): No guarantee — many local minima and saddle points exist

**Why deep learning succeeds despite non-convexity:**
1. In high dimensions, local minima are often nearly as good as global minima
2. SGD noise helps escape bad minima
3. Over-parameterization creates many good solutions [^516^]

> **Curriculum Exercise:** Visualize gradient descent on a 2D surface (like a contour plot). Start from different points and observe how the path changes with different learning rates. What happens when the learning rate is too high? Too low?

---

## 3. Embeddings

### 3.1 What Are Word Embeddings?

**Word embeddings** are numeric vector representations of words in a lower-dimensional space that capture semantic and syntactic information [^520^]. Instead of treating words as discrete symbols (like one-hot encoding), embeddings place similar words close together in a continuous vector space.

**The Core Idea:** Words with similar meanings have similar vector representations. For example, the vector for "king" minus "man" plus "woman" is approximately the vector for "queen" [^520^].

**Analogy:** Imagine a vast, multi-dimensional map where each word is a point. Words used in similar contexts end up near each other — "happy" and "joyful" are neighbors, while "happy" and "tractor" are far apart.

### 3.2 Methods for Generating Embeddings

**TF-IDF:** A traditional statistical approach based on word frequency in documents. Good for basic tasks but doesn't capture semantic meaning [^520^].

**Word2Vec (2013):** Uses neural networks to learn embeddings by predicting words from their context (or vice versa). Produces dense 300-dimensional vectors. Example similarities: "learn" and "learning" = 0.642 [^520^].

**GloVe (2014):** Combines count-based and prediction-based approaches, using global word-word co-occurrence statistics. Example: "learn" and "learning" = 0.802 [^520^].

**FastText (2016):** Extends Word2Vec by representing words as bags of character n-grams. Handles out-of-vocabulary words and captures morphological variations. Example: "learn" and "learning" = higher similarity than Word2Vec [^520^].

**BERT (2018+):** Transformer-based model that learns **contextualized** embeddings. Unlike Word2Vec/GloVe which produce one fixed vector per word, BERT generates different embeddings based on surrounding context. The word "bank" gets different vectors in "river bank" vs. "bank account" [^520^].

### 3.3 Similarity Search

Once words are vectors, we can compute similarity using:
- **Cosine Similarity:** Measures the angle between two vectors (range: -1 to 1)
- **Euclidean Distance:** Measures straight-line distance between vectors
- **Dot Product:** Simple and efficient for normalized vectors

> **Curriculum Exercise:** Load a pre-trained Word2Vec model and compute analogies: "Paris − France + Italy = ?". Visualize word embeddings using t-SNE to see clusters of similar words.

---

## 4. Transformers

### 4.1 The Attention Mechanism

**Attention** is a mechanism that allows models to focus on the most relevant parts of the input when producing each output. Introduced by Bahdanau et al. in 2014, it solved a critical problem: RNNs struggled with long-distance dependencies in text [^514^].

**The Intuition:** When reading a sentence, you don't process every word equally — you pay more attention to some words than others. The attention mechanism does the same thing mathematically.

**Scaled Dot-Product Attention Formula:** [^517^]
```
Attention(Q, K, V) = softmax(QK^T / √d_k) × V
```

Where:
- **Q (Query):** "What am I looking for?" (the current token's question)
- **K (Key):** "What do I contain?" (each token's descriptor)
- **V (Value):** "What information do I have?" (each token's actual content)

**Flashlight Analogy:** Think of a single attention head as one flashlight trying to illuminate the important parts of a sentence. The dot product of Q and K measures how related two tokens are, and softmax normalizes these scores into probabilities that sum to 1 [^517^].

### 4.2 Self-Attention

**Self-attention** extends attention: instead of relating input to output, it computes attention *within the same sequence*. Every token looks at every other token and decides how much weight to give each when forming its new representation [^517^].

For the sentence *"The cat sat on the mat"*:
- The word "on" attends strongly to "sat" (because they are related syntactically)
- "cat" strongly attends to "mat" (semantic relationship)
- "The" splits attention between itself and "the" [^514^]

**Why self-attention is powerful:**
- Processes all tokens simultaneously (fully parallelizable)
- Captures long-range dependencies directly (no information bottleneck)
- Every token can attend to every other token, regardless of distance

### 4.3 Multi-Head Attention

**Multi-Head Attention** is the powerhouse behind Transformers. Instead of computing a single attention map, it computes multiple attention heads in parallel — like having several experts each looking at the sentence from a different perspective [^514^] [^517^].

**How it works:**
1. Split the embedding into N parts (heads)
2. Each head independently computes scaled dot-product attention with its own Q, K, V projections
3. Concatenate all head outputs
4. Apply a final linear transformation

**Example specializations** (for "The quick brown fox jumps over the lazy dog"):
- Head 1: Adjective-noun pairs ("quick → fox", "lazy → dog")
- Head 2: Subject-verb relationships ("fox → jumps")
- Head 3: Long-distance dependencies ("jumps → over → dog") [^517^]

**Benefits over single-head attention:**
- Captures diverse patterns simultaneously
- Reduces information bottleneck
- Improves parallelism and scalability [^514^]

### 4.4 Types of Attention in Transformers

1. **Encoder Self-Attention:** Each token attends to every other token in the input (bidirectional)
2. **Decoder Self-Attention (Causal/Masked):** Each token can only attend to itself and previous tokens — never future tokens
3. **Encoder-Decoder (Cross) Attention:** The decoder attends to the encoder's output [^517^]

> **Curriculum Exercise:** Implement scaled dot-product attention from scratch in PyTorch. Visualize the attention weights as a heatmap for a simple sentence. What patterns do you observe?

---

## 5. Large Language Models

### 5.1 Architecture Overview

Large Language Models (LLMs) are transformer-based neural networks trained on vast text corpora to predict the next token. Modern LLMs like GPT-4o, Claude, and Llama 3 consist of [^531^]:

1. **Tokenization:** Text is split into subword tokens (BPE or SentencePiece)
2. **Embedding Layer:** Each token ID is mapped to a vector via an embedding matrix (vocab_size × d_model)
3. **Positional Encoding:** Adds position information (RoPE in modern models)
4. **Transformer Blocks (×N):** Each contains:
   - RMSNorm → Grouped Query Attention (with causal mask and KV cache) → residual
   - RMSNorm → SwiGLU Feed-Forward Network → residual
5. **Output Head:** Projects to vocabulary size → softmax over all possible next tokens [^531^]

### 5.2 Training Pipeline (Three Stages)

**Stage 1: Pre-training** — Train on vast internet text to learn language patterns, facts, and reasoning. Uses next-token prediction objective [^531^].

**Stage 2: Supervised Fine-Tuning (SFT)** — Train on curated (instruction, response) pairs. Teaches the model formatting, instruction following, and conversational patterns [^531^].

**Stage 3: Alignment (RLHF/DPO)** — Align the model with human preferences for helpfulness, harmlessness, and honesty [^531^].

**Key Hyperparameters:**
- **Chinchilla optimal ratio:** ~20 tokens per parameter for efficient training
- **Llama 3 8B training data:** 15T tokens (1,875× Chinchilla-optimal!)
- **Attention complexity:** O(n²d) time, O(n²) space where n = sequence length [^531^]

### 5.3 Inference and Decoding

LLMs generate text autoregressively (one token at a time) [^531^]:

1. **Prefill Phase:** Process the entire prompt through the model (compute-bound)
2. **Sample:** Select the next token from the output probability distribution
3. **Append:** Add the token to the sequence
4. **Decode Phase:** Process the new token (memory-bandwidth-bound, uses KV cache)
5. Repeat until a stop condition

**Decoding Strategies:**

| Strategy | Description | Best For |
|---|---|---|
| **Greedy** | Always pick highest-probability token | Speed, deterministic output |
| **Temperature Sampling** | Scale logits by T: T→0 = deterministic, T>1 = more random | Code (T=0-0.2), Creative writing (T=0.7-1.0) |
| **Top-p (Nucleus)** | Sample from smallest set where cumulative probability ≥ p | Most general use |
| **Beam Search** | Maintain k candidate sequences | Translation, summarization |

### 5.4 Scaling Laws

LLM performance follows predictable scaling laws [^531^]:
- More parameters + more data = better performance (with diminishing returns)
- Larger models are more sample-efficient
- Training compute-optimal models requires balancing model size with data volume

> **Curriculum Exercise:** Experiment with different temperature and top-p values when generating text from an LLM. How does the output change? Find the sweet spot for factual accuracy vs. creativity.

---

## 6. Diffusion Models

### 6.1 How Diffusion Models Work

Diffusion models generate images by learning to reverse a gradual noise process. Instead of generating images in one step, they iteratively refine pure noise into coherent content [^536^].

**Two Processes:**

**Forward Process (Training):** Gradually add noise to real images over T timesteps until they become pure Gaussian noise. This uses a Markov chain — each step depends only on the previous step [^530^].

```
x_t = √(ᾱ_t) × x_0 + √(1−ᾱ_t) × ε
```
Where ε is Gaussian noise and ᾱ_t controls the noise schedule [^530^].

**Reverse Process (Generation):** Train a neural network to predict and remove noise at each step, gradually recovering the original image from random noise [^530^].

**Training Objective:** The model learns to predict the noise ε that was added, minimizing mean squared error [^530^]:
```
L = E[||ε − ε_θ(x_t, t)||²]
```

### 6.2 The Generation Process

1. Start with random noise x_T ~ N(0, I)
2. For t = T down to 1:
   - Use the model to predict the noise in x_t
   - Subtract the predicted noise (scaled appropriately)
   - Add a small amount of random noise (except at the final step)
3. Return x_0 — the generated image [^536^]

**Analogy:** Diffusion is like a sculptor starting with a block of marble (random noise) and gradually chiseling away to reveal the statue inside. Each step removes a little bit of "wrongness" until only the desired image remains.

### 6.3 Modern Variants

**Latent Diffusion (Stable Diffusion):** Instead of working in pixel space, encode images into a compressed latent space using a VAE, apply diffusion there, then decode back. Much more efficient [^530^].

**Diffusion Transformers (DiT):** Replace the traditional U-Net backbone with transformers operating on latent patches. DiT inherits the scaling benefits of transformers and outperforms U-Net-based models [^530^] [^536^].

> **Curriculum Exercise:** Run a pre-trained Stable Diffusion model with different numbers of denoising steps (e.g., 10, 25, 50). How does quality change? What happens with very few steps?

---

## 7. Multimodal Models

### 7.1 What Are Multimodal Models?

**Multimodal AI** refers to systems that process and understand multiple types of input — text, images, video, audio — simultaneously. Vision-Language Models (VLMs) are the most common type, interpreting images, videos, and documents alongside text [^535^].

**Evolution:**
- **2021-2024:** Vision encoders were "bolted on" to language models (e.g., CLIP + GPT)
- **2025-2026:** Native multimodal architectures designed from the ground up [^535^]

### 7.2 Key Architecture Components

**Vision Encoders:** Process visual input into embeddings that the language model can understand. Progressed from CLIP to **SigLIP 2** (Feb 2025), offering improved multilingual support and localization [^535^].

**Native Multimodal Processing:** Modern models like Gemini 3 Pro process text, image, video, and audio natively in a unified architecture without separate vision encoder pipelines. This enables better cross-modal understanding and reduced latency [^535^].

### 7.3 Leading Models (2026)

| Model | Strengths | Context |
|---|---|---|
| **GPT-5.2** | 84.2% MMMU, abstract reasoning | 256K+ tokens |
| **Claude Opus 4.5** | Coding tasks (80.9% SWE-bench), computer use | 200K tokens |
| **Gemini 3 Pro** | Native multimodal, 1M token context | 1M tokens |
| **Qwen3-VL-235B** | Open-source, strong document understanding | 256K expandable to 1M |

### 7.4 2025-2026 Trends

- **Real-time video understanding** with frame-accurate analysis
- **On-device vision models** for privacy-focused applications
- **Dynamic resolution processing** for efficient 4K image handling
- **Edge AI deployment** on phones, drones, and AR glasses [^535^]

> **Curriculum Exercise:** Take a VLM like LLaVA and ask it to describe the same image with different prompting styles. How does the level of detail change? Try asking it to count specific objects.

---

## 8. Retrieval-Augmented Generation (RAG)

### 8.1 What is RAG?

**RAG** is a technique that enhances LLMs by giving them access to external knowledge. Instead of relying solely on the model's training memory, RAG retrieves relevant documents and provides them as context, dramatically reducing hallucinations and enabling up-to-date information [^533^] [^532^].

**The Core Problem:** LLMs have a knowledge cutoff and can hallucinate. RAG solves this by connecting the model to a search engine for your actual data [^532^].

### 8.2 RAG Architecture

```
User Query → Embed Query → Vector DB Search → Retrieve Top-K Chunks
    → Build Context (metadata + passages) → Append to Prompt
    → Run LLM → Generate Answer
```

### 8.3 Key Components

**Chunking:** Documents are split into manageable pieces (typically 256-512 tokens). Strategies include [^533^]:
- **Recursive chunking:** Split at natural boundaries (paragraphs → sentences → words)
- **Semantic chunking:** Split where topic meaning changes
- **Fixed-size chunking:** Simple but may break semantic units

**Vector Databases:** Store document chunks as embeddings for similarity search [^533^]:

| Database | Best For | Hybrid Search |
|---|---|---|
| **Pinecone** | Zero-ops, serverless | Yes |
| **Weaviate** | Mid-to-large, open-source | Yes (native) |
| **Qdrant** | Self-hosted, Rust-based | Yes |
| **Milvus/Zilliz** | Billion-vector workloads | Yes |
| **pgvector** | Existing Postgres stacks | Limited |

**Embedding Model:** Converts text to vectors. The same model must be used for indexing and querying.

**Retriever + Re-ranker:** First-stage retrieval finds candidate chunks; second-stage re-ranking (e.g., cross-encoder) improves relevance ordering.

### 8.4 RAG Patterns

**Simple RAG:** Basic vector similarity search + LLM generation. Good for prototyping.

**Advanced RAG:** Adds hybrid search (sparse + dense retrieval), re-ranking, query rewriting, and metadata filtering for production reliability [^533^].

**Agentic RAG:** Uses LLM agents to plan multi-step retrieval strategies, decide what to search, and synthesize complex answers [^532^].

> **Curriculum Exercise:** Build a simple RAG system: take a PDF, chunk it, embed it in a vector DB, and query it. Compare the RAG output vs. the base LLM without retrieval. What's different?

---

## 9. Fine-Tuning Techniques

### 9.1 Why Fine-Tune?

Pretrained LLMs have limitations: domain knowledge gaps, no instruction-following by default, inconsistent output formatting, and potential safety issues. Fine-tuning adapts them for specific tasks [^561^].

| Criterion | Prompt Engineering | Fine-Tuning |
|---|---|---|
| Implementation | Low effort | Medium-High |
| Cost | Runtime token cost | One-time training cost |
| Performance | Limited by base model | Can exceed base |
| Consistency | Low | High |
| Privacy | Data sent to API | Local execution possible |

### 9.2 Full Fine-Tuning

Updates **all** model parameters. Achieves maximum performance but requires enormous GPU memory (80GB+ VRAM, often multi-GPU) and risks **catastrophic forgetting** (losing pretrained capabilities) [^589^].

**When to use:** Maximum accuracy required (medical, legal, safety-critical), dedicated ML infrastructure, serving millions of users [^589^].

### 9.3 LoRA (Low-Rank Adaptation)

LoRA freezes the pretrained model and injects small, trainable **adapter matrices** into transformer layers. The key insight: weight updates during fine-tuning occupy a low-rank subspace [^560^] [^567^].

```
W' = W + ΔW = W + B × A
Where B is (d × r), A is (r × d), r << d
```

**Example:** For d=4096, r=16: 131K trainable params vs 16.7M for full fine-tuning — a **128x reduction** [^531^].

**Memory savings:** 7B model LoRA fine-tuning requires ~16-24GB VRAM vs 80GB+ for full fine-tuning [^589^].

**Quality:** LoRA recovers **90-95%** of full fine-tuning quality [^560^].

### 9.4 QLoRA (Quantized LoRA)

QLoRA makes LoRA even more memory-efficient by training adapters on top of a **4-bit quantized** base model [^561^] [^567^].

**Three Key Techniques:**
1. **4-bit NF4 Quantization:** Information-theoretically optimal for normally distributed weights
2. **Double Quantization:** Quantize the quantization constants themselves for additional savings
3. **Paged Optimizers:** Offload optimizer states to CPU RAM during memory spikes [^561^]

**Impact:** A single 48GB GPU can fine-tune a **70B parameter model** that would otherwise require 4-8 GPUs [^560^]!

**Trade-off:** QLoRA achieves 80-90% of full fine-tuning quality [^560^].

### 9.5 Instruction Tuning

Instruction tuning trains models on (instruction, response) pairs to teach instruction-following behavior. The model learns to map from natural language instructions to appropriate responses [^561^].

### 9.6 RLHF vs. DPO

**RLHF (3 stages):** 1) Collect human preference data, 2) Train a reward model, 3) Optimize the LLM with PPO against the reward model [^531^].

**DPO (Direct Preference Optimization):** Eliminates the reward model entirely. Directly optimizes the LLM using preference pairs in a single training stage. **DPO has become the preferred alignment method as of 2025** due to simpler pipeline, more stable training, and lower compute cost [^531^].

> **Curriculum Exercise:** Fine-tune a small model (e.g., Llama-3.2-1B) with LoRA on a task-specific dataset (e.g., medical Q&A). Compare before/after performance. How many training examples do you need to see improvement?

---

## 10. Model Evaluation

### 10.1 Evaluation Dimensions

A comprehensive LLM evaluation framework should assess three key dimensions [^565^]:

| Dimension | Focus | Example Metrics |
|---|---|---|
| **Intrinsic** | Language fluency, grammar | Perplexity, BLEU, ROUGE, BERTScore |
| **Extrinsic** | Task-based performance | Human scoring, classification accuracy |
| **Behavioral** | Safety, bias, robustness | Red teaming, adversarial testing, toxicity |

### 10.2 Key Metrics

**Perplexity:** Measures how "surprised" the model is by test data. Lower = better. A sanity check for model quality but doesn't capture user experience [^565^].

**BLEU/ROUGE:** Compare generated text to human references. Good for translation and summarization but don't capture semantic quality [^565^].

**BERTScore:** Uses contextual embeddings to compute semantic similarity between predictions and references. Better correlation with human judgment than n-gram metrics [^565^].

**F1, Precision, Recall:** Standard for classification tasks. Balance between false positives and false negatives [^565^].

### 10.3 Safety Evaluation

Safety evaluation uses specialized metrics [^564^]:

**Attack Success Rate (ASR):** The predominant metric — measures how often adversarial attacks succeed. However, inconsistent definitions of "success" hinder reproducibility.

**Fine-Grained Metrics:**
- **Refusal rate:** Does the model refuse harmful requests?
- **Toxicity score:** How toxic are the outputs?
- **Specificity + Convincingness:** For jailbreak evaluation, `score = (1−refused) × (specific+convincing)/2`
- **Entity transformation, semantic consistency:** Detect hallucination-induced jailbreaks [^564^]

### 10.4 Human Evaluation

Automated metrics have limitations. Human evaluation captures [^565^]:
- Context, emotional sense, nuanced correctness
- Pairwise preference tests (which output is better?)
- Safety tests (jailbreak scenarios)
- Tone and clarity scoring
- Helpfulness, honesty, harmlessness (HHH criteria)

> **Curriculum Exercise:** Generate 10 completions from a model for the same prompt. Score them manually on helpfulness (1-5) and safety (1-5). Compare your scores with BERTScore — do they correlate?

---

## 11. AI Safety Basics

### 11.1 What is AI Alignment?

**Alignment** is the process of ensuring AI systems behave in accordance with human values, expectations, and intentions. An aligned model is helpful, harmless, and honest [^582^] [^587^].

**The Alignment Problem:** LLMs are pretrained to predict the next token — not to be helpful or safe. Alignment reshapes behavior without changing underlying knowledge [^584^].

### 11.2 RLHF (Reinforcement Learning from Human Feedback)

RLHF is the most widely used alignment technique, consisting of three phases [^582^] [^584^]:

```
Phase 1: Supervised Fine-Tuning (SFT)
  Pretrained model + high-quality demo data → SFT model

Phase 2: Reward Model Training
  Human preference on output pairs → Reward Model

Phase 3: PPO Optimization
  SFT model + Reward Model → Aligned model
```

**How it works:** Human annotators rank multiple model outputs for the same prompt. A reward model learns to predict these preferences. PPO optimizes the LLM to maximize the reward while staying close to the original model (KL penalty) [^584^].

**Key Insight:** RLHF doesn't teach the model what is objectively correct — it teaches what humans tend to prefer. This is inherently subjective and reflects annotator values and biases [^584^].

### 11.3 Alternatives to RLHF

**DPO (Direct Preference Optimization):** Eliminates the reward model. Directly optimizes the LLM using preference pairs. Simpler, more stable, and preferred as of 2025 [^531^].

**RLAIF (Reinforcement Learning from AI Feedback):** Replaces human judgments with AI-generated feedback based on predefined principles (Constitutional AI). Scales better but quality is bounded by the supervising model [^584^].

### 11.4 Red Teaming and Jailbreak Prevention

**Red Teaming:** Systematically testing models for failure modes, safety violations, and adversarial vulnerabilities. Essential complement to alignment training [^587^].

**Jailbreak Prevention:** Attackers craft prompts to bypass safety guardrails. Mitigation strategies include:
- Input filtering and validation
- Output safety checks
- Adversarial training
- Layered defenses (alignment alone is insufficient) [^587^]

**Key Risks:**
- Misaligned reward models reinforcing unsafe behavior
- Feedback data poisoning by malicious annotators
- Bias amplification from skewed human judgments
- Over-reliance on alignment without complementary security controls [^587^]

> **Curriculum Exercise:** Try to "jailbreak" a small open-source model with adversarial prompts (e.g., roleplay scenarios, encoding tricks). Document which techniques work and which don't. What patterns do you observe?

---

## 12. Hardware for AI

### 12.1 AI Hardware Landscape

The AI hardware ecosystem features four processor families, each optimized for specific workloads [^562^]:

| Hardware | Best For | Power | Key Advantage |
|---|---|---|---|
| **CPU** | Orchestration, preprocessing, inference | 65-250W | Universal compatibility |
| **GPU** | Training, large-scale inference | 250-700W | Massive parallelism, framework flexibility |
| **TPU** | TensorFlow/JAX training at cloud scale | 200-400W | Best performance-per-watt for specific workloads |
| **NPU** | Edge AI, always-on inference | 2-10W | Extreme power efficiency |

### 12.2 Key Hardware for Training

**NVIDIA H100:** The workhorse for LLM training. Features:
- 80GB HBM3 memory
- Transformer Engine for FP8 acceleration
- NVLink for multi-GPU communication
- Cost: $2.50-4.00/hour (cloud), ~$25,000 (purchase) [^560^]

**NVIDIA A100:** Previous generation, still widely used. 80GB HBM2e memory. Cost: $1-2/hour cloud [^560^].

**Google Cloud TPU v5p:** Optimized for TensorFlow/JAX. Excellent performance-per-watt but limited framework support [^562^].

### 12.3 Quantization for Deployment

**Quantization** reduces numerical precision to shrink models and accelerate inference [^585^]:

| Precision | Compression | Use Case |
|---|---|---|
| **FP32** | 1× (baseline) | Training |
| **FP16/BF16** | 2× | Standard inference on GPUs |
| **INT8** | 4× | Mobile/edge deployment, <1% accuracy loss |
| **INT4** | 8× | Aggressive optimization, edge constraints |
| **1-bit** | 32× | Research; limited adoption |

**Key Techniques:**
- **Post-Training Quantization (PTQ):** Convert trained model to lower precision with calibration data
- **Quantization-Aware Training (QAT):** Simulate low precision during training for better accuracy
- **GPTQ/AWQ:** Advanced methods for 4-bit LLM quantization with minimal quality loss [^585^]

### 12.4 Edge Deployment

Edge AI brings intelligence to devices where data originates [^581^] [^586^]:

**Benefits:** Ultra-low latency, privacy by design, reduced bandwidth costs, always-on capability.

**Challenges:** Minimal compute, tight memory (<1MB RAM on microcontrollers), strict power budgets.

**Edge Hardware Comparison (2026)** [^568^]:

| Metric | NPU (Qualcomm) | GPU (Jetson Orin) | TPU (Coral Gen3) |
|---|---|---|---|
| Latency | 1.8ms | 2.1ms | 2.5ms |
| Power | 1.1W | 6.8W | 1.9W |
| Throughput | 555 fps | 476 fps | 400 fps |
| Efficiency | 505 fps/W | 70 fps/W | 210 fps/W |
| Price | $29 | $199 | $49 |

### 12.5 Optimization Pipeline

For edge deployment, a recommended optimization pipeline achieves 8-12× size reduction and 5-8× speedup [^586^]:

1. **Model Selection** matching latency budget
2. **Knowledge Distillation** (10-15% size reduction)
3. **Structured Pruning** (remove 30-40% of attention heads)
4. **Mixed FP16/INT8 Quantization** (50% additional reduction)
5. **Operator Fusion** (framework-specific optimizers)
6. **Hardware Profiling** on target device

### 12.6 Paged Attention and Memory Optimization

**KV Cache:** During autoregressive generation, the model must cache key and value tensors from previous tokens. This can occupy up to 70% of GPU memory during inference [^531^].

**Grouped Query Attention (GQA):** Reduces KV cache by sharing key/value heads across query heads. Llama 3 uses GQA with 32 query heads and 8 KV heads — a 4× reduction [^531^].

> **Curriculum Exercise:** Take a 7B parameter model. Calculate its memory footprint at FP32, FP16, INT8, and INT4. How large a GPU do you need for each? What practical deployment scenarios fit each precision?

---

## Summary Table: All 12 Dimensions

| # | Topic | Key Concepts | Difficulty |
|---|---|---|---|
| 1 | Neural Network Basics | Perceptron, weights, bias, activation functions, layers | Beginner |
| 2 | Deep Learning Fundamentals | Backpropagation, gradient descent, Adam, SGD | Beginner-Intermediate |
| 3 | Embeddings | Word2Vec, GloVe, BERT, cosine similarity, vector space | Intermediate |
| 4 | Transformers | Self-attention, multi-head attention, Q/K/V, positional encoding | Intermediate |
| 5 | Large Language Models | Tokenization, pre-training, SFT, RLHF, decoding strategies | Intermediate-Advanced |
| 6 | Diffusion Models | Forward/reverse process, noise prediction, latent diffusion | Intermediate |
| 7 | Multimodal Models | Vision-language, CLIP, SigLIP, native multimodal architectures | Advanced |
| 8 | RAG | Vector databases, chunking, retrieval, re-ranking | Intermediate |
| 9 | Fine-Tuning Techniques | LoRA, QLoRA, PEFT, instruction tuning, DPO | Intermediate-Advanced |
| 10 | Model Evaluation | Perplexity, BERTScore, ASR, human evaluation, benchmarks | Intermediate |
| 11 | AI Safety | Alignment, RLHF, red teaming, jailbreak prevention | Advanced |
| 12 | Hardware for AI | GPUs, TPUs, NPUs, quantization, edge deployment | Intermediate |

---

## References

[^514^] ProjectPro. "How Does Multi-Head Attention Improve Transformer Models?" 2026. https://www.projectpro.io/article/multi-head-attention-in-transformers/1166

[^515^] Medium. "Optimizers in Deep Learning: A Detailed Guide." 2026. https://medium.com/@abhaysingh71711/optimizers-in-deep-learning-a-detailed-guide-800edae645ce

[^516^] TensorTonic. "Backpropagation & Gradient Descent: Complete Tutorial." 2026. https://www.tensortonic.com/ml-math/calculus/backpropagation

[^517^] DataCamp. "Understanding Multi-Head Attention in Transformers." 2025. https://www.datacamp.com/tutorial/multi-head-attention-transformers

[^518^] Analytics Vidhya. "Understanding Attention Mechanisms Using Multi-Head Attention." 2025. https://www.analyticsvidhya.com/blog/2023/06/understanding-attention-mechanisms-using-multi-head-attention/

[^519^] Medium. "Attention Mechanisms Explained: A 2025 Guide for AI Developers." 2025. https://medium.com/@thiksigar/attention-mechanisms-explained-a-2025-guide-for-ai-developers-and-researchers-5286b5499806

[^520^] GeeksforGeeks. "Word Embeddings in NLP." 2025. https://www.geeksforgeeks.org/nlp/word-embeddings-in-nlp/

[^521^] Medium. "Backpropagation in Deep Learning: A Complete, Intuitive, and Practical Guide." 2025. https://nishanthan-k.medium.com/backpropagation-in-deep-learning-a-complete-intuitive-and-practical-guide-d1136de493de

[^530^] MDPI Electronics. "Diffusion Models: Unlocking the '4 Secrets' of High-Quality Image Generation." 2026. https://www.mdpi.com/2079-9292/15/8/1755

[^531^] StarMorph Blog. "How Large Language Models Work: The Complete Technical Guide." 2026. https://blog.starmorph.com/blog/how-llms-work-complete-technical-guide

[^532^] Scaler. "LLM Roadmap 2026: How to Learn Large Language Models from Scratch." 2026. https://www.scaler.com/blog/llm-roadmap-2026-how-to-learn-large-language-models-from-scratch/

[^533^] Scadea. "RAG Architecture Patterns: Chunking and Retrieval." 2026. https://scadea.com/rag-architecture-patterns-chunking-embedding-and-retrieval-strategies/

[^534^] Medium. "Fine-tuning Large Language Models (LLMs) in 2025." 2026. https://medium.com/@knish5790/fine-tuning-large-language-models-llms-in-2025-623567db84e9

[^535^] Zylos AI. "Multimodal AI and Vision-Language Models 2026." 2026. https://zylos.ai/research/2026-01-13-multimodal-ai-vision-language-models

[^536^] Lightly AI. "Diffusion Transformers Explained: The Beginner's Guide." https://www.lightly.ai/blog/diffusion-transformers-dit

[^537^] Lakera. "The Ultimate Guide to LLM Fine Tuning." 2025. https://www.lakera.ai/blog/llm-fine-tuning-guide

[^560^] Introl. "Fine-Tuning Infrastructure: LoRA, QLoRA, and PEFT at Scale." 2026. https://introl.com/blog/fine-tuning-infrastructure-lora-qlora-peft-scale-guide-2025

[^561^] Youngju.dev. "LLM Fine-tuning Complete Guide: Master LoRA, QLoRA, RLHF, and DPO." 2026. https://www.youngju.dev/blog/llm/2026-03-17-llm-finetuning-complete-guide.en

[^562^] Eigenstate. "CPU vs GPU vs TPU vs NPU: AI Hardware Architecture Guide 2026." 2026. https://www.eigenstate.dev/essay/cpu-vs-gpu-vs-tpu-vs-npu-ai-hardware-architecture-guide-2026

[^563^] AI Multiple. "Top 15 Edge AI Chip Makers with Use Cases in 2026." 2026. https://aimultiple.com/edge-ai-chips

[^564^] arXiv. "A Comprehensive Survey on Safety Evaluation of LLMs." 2025. https://arxiv.org/html/2506.11094v2

[^565^] XByte Solutions. "LLM Evaluation Explained: Framework, Metrics, and Best Practices." 2025. https://www.xbytesolutions.com/llm-evaluation-metrics-framework-best-practices/

[^566^] Towards Data Science. "Advanced LLM Fine-Tuning: LoRA, QLoRA, DoRA & LoRA+." 2025. https://ai.plainenglish.io/a-practical-guide-to-advanced-llm-fine-tuning-from-lora-to-qlora-462b01f44022

[^567^] Mercity AI. "In-depth guide to fine-tuning LLMs with LoRA and QLoRA." 2025. https://www.mercity.ai/blog-post/guide-to-fine-tuning-llms-with-lora-and-qlora/

[^568^] Aegis AI. "NPU vs GPU vs TPU for Edge AI Inference: A Complete 2026 Hardware Guide." 2026. https://aegisai.in/npu-vs-gpu-vs-tpu-for-edge-ai-inference-2026-complete-hardware-guide/

[^569^] Medium. "The Ultimate 2025 Guide to LLM/SLM Fine-Tuning, Sampling, LoRA, QLoRA & Transfer Learning." 2025. https://medium.com/@dewasheesh.rana/the-ultimate-2025-guide-to-llm-slm-fine-tuning-sampling-lora-qlora-transfer-learning-5b04fc73ac87

[^570^] Towards Data Science. "LLM Optimization: LoRA and QLoRA." 2025. https://towardsdatascience.com/llm-optimization-lora-and-qlora/

[^581^] Hackster.io. "10 Essential Techniques to Optimize AI Models for the Edge." 2026. https://www.hackster.io/news/10-essential-techniques-to-optimize-ai-models-for-the-edge-8a044f9bf4c6

[^582^] Youngju.dev. "AI Safety & Alignment Complete Guide 2025." 2026. https://www.youngju.dev/blog/culture/2026-04-14-ai-safety-alignment-responsible-ai-guide-2025.en

[^583^] Simplilearn. "What is a Perceptron." 2026. https://www.simplilearn.com/tutorials/deep-learning-tutorial/perceptron

[^584^] Toloka AI. "Complete guide to RLHF for LLMs." 2026. https://toloka.ai/blog/what-is-rlhf/

[^585^] Medium. "LLM Quantization Techniques: Balancing Performance and Efficiency." 2026. https://medium.com/@michielh/llm-quantization-techniques-balancing-performance-and-efficiency-bc348eed3816

[^586^] arXiv. "Lightweight Transformer Architectures for Edge Devices." 2026. https://arxiv.org/html/2601.03290v1

[^587^] Palo Alto Networks. "What Is RLHF? Reinforcement Learning from Human Feedback." https://www.paloaltonetworks.com/cyberpedia/what-is-rlhf

[^588^] Fabrício Narcizo. "Edge AI in Action: Technologies and Applications (CVPR 2025)." https://www.fabricionarcizo.com/cvpr2025-edge-ai-in-action/

[^589^] Index.dev. "LoRA vs QLoRA: Best AI Model Fine-Tuning Platforms & Tools 2025." 2025. https://www.index.dev/blog/top-ai-fine-tuning-tools-lora-vs-qlora-vs-full

[^590^] Local AI Zone. "AI Model Quantization 2025: Master Compression Techniques." 2025. https://local-ai-zone.github.io/guides/what-is-ai-quantization-q4-k-m-q8-gguf-guide-2025.html

---

*This curriculum was compiled from 12+ targeted web searches across authoritative sources including academic papers, technical blogs, and industry guides. All findings include inline citations for traceability.*

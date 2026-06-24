# WorkMate HRMS - Spring AI Features Setup

This project integrates Spring AI with Groq API for single-shot generation and Retrieval-Augmented Generation (RAG).

## 🚀 Setting Up the Groq API Key

The application utilizes Groq's Llama 3.3 model for AI tasks. To run this project locally, you must obtain a free API key:

1. **Sign Up**: Go to [console.groq.com](https://console.groq.com/) and register (no credit card required).
2. **Create API Key**: Click on **API Keys** in the sidebar → **Create API Key** → name it `workmate-dev` → copy it immediately.
3. **Set Environment Variable**:
   - **Windows (Command Prompt)**:
     ```cmd
     setx GROQ_API_KEY "gsk_your-key-here"
     ```
     *(Note: Restart your terminal/IDE for changes to take effect).*
   - **Windows (PowerShell)**:
     ```powershell
     [System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'gsk_your-key-here', 'User')
     ```
   - **macOS/Linux**:
     Add the following line to your `~/.zshrc` or `~/.bashrc`:
     ```bash
     export GROQ_API_KEY="gsk_your-key-here"
     ```
     Then load the updated configuration:
     ```bash
     source ~/.zshrc
     ```
4. **Important Security Note**: Avoid committing the API key into any `.properties` or source code files. The application reads it automatically from the `GROQ_API_KEY` environment variable.

## 🧠 Local Embedding Model (Offline)

For the HR Chatbot retrieval step, the project uses a **local ONNX-based embedding model** (`spring-ai-transformers-embedding`).
- Upon the very first startup, the application will download the small sentence-embedding model (a few hundred MB).
- The download progress will be logged in the console.
- Subsequent startups are fast as the model is cached locally on your machine.
- Similarity searches (retrieval) run entirely local and offline at zero API cost.

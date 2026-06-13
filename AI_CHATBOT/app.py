import os
import streamlit as st
from dotenv import load_dotenv
import chromadb
from rag_pipeline import (
    process_document,
    chunk_text,
    add_documents_to_db,
    get_chat_chain,
    clear_vector_db,
    format_chat_history,
    get_vector_store
)
from utils import clear_directory

# Setup page
st.set_page_config(page_title="Educator AI Chatbot", page_icon="📚", layout="wide")

# Load Environment Variables
# In production Streamlit, use st.secrets. For local, we use dotenv.
load_dotenv()
try:
    os.environ["GOOGLE_API_KEY"] = st.secrets.get("GEMINI_API_KEY", "") or st.secrets.get("GOOGLE_API_KEY", "")
except Exception:
    pass

if not os.environ.get("GOOGLE_API_KEY") and not os.environ.get("GEMINI_API_KEY"):
    st.warning("⚠️ API Key is missing. Please add GEMINI_API_KEY to your .env file.")

# Simple check to stop execution if no key
if not os.environ.get("GOOGLE_API_KEY") and not os.environ.get("GEMINI_API_KEY"):
    st.stop()
    
# Sync env vars
if not os.environ.get("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Initialize Session State
if "messages" not in st.session_state:
    st.session_state.messages = []
if "docs_processed" not in st.session_state:
    st.session_state.docs_processed = False

# Sidebar
with st.sidebar:
    st.title("📚 Teacher Controls")
    st.caption("Manage the documents in your AI's 'filing cabinet'.")
    
    uploaded_file = st.file_uploader("Upload Syllabus/Material", type=["pdf", "docx"])
    
    if uploaded_file and not st.session_state.docs_processed:
        with st.spinner("Reading and organizing your document..."):
            # Save file temporarily
            temp_dir = "./temp_uploads"
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, uploaded_file.name)
            
            with open(temp_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
                
            try:
                # 1. Extraction
                text = process_document(uploaded_file.name, temp_path)
                
                # 2. Chunking
                chunks = chunk_text(text, source=uploaded_file.name)
                
                # 3. Vector Database
                vs = get_vector_store()
                add_documents_to_db(chunks, vs)
                
                st.session_state.docs_processed = True
                st.success(f"Successfully processed {uploaded_file.name}!")
            except Exception as e:
                st.error(f"Error processing document: {e}")
            finally:
                # Cleanup temp file
                clear_directory(temp_dir)
                
    st.divider()
    
    st.subheader("Database Management")
    if st.button("🗑️ Clear Database"):
        with st.spinner("Clearing memory..."):
            try:
                # Clear vector DB completely from local disk
                clear_vector_db()
                st.session_state.messages = []
                st.session_state.docs_processed = False
                st.success("Database cleared!")
                st.rerun()
            except Exception as e:
                st.error(f"Failed to clear: {e}")

# Main Interface
st.title("Educator AI Chatbot")
st.markdown("Ask questions about the uploaded syllabus and materials.")

# Display chat messages from history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Accept user input
if prompt := st.chat_input("E.g., What is the grading policy for late homework?"):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate response
    with st.chat_message("assistant"):
        if not st.session_state.docs_processed:
            st.warning("Please upload a document first before asking questions.")
        else:
            with st.spinner("Searching filing cabinet and thinking..."):
                try:
                    chain = get_chat_chain()
                    chat_history_str = format_chat_history(st.session_state.messages[:-1])
                    
                    response = chain.invoke({
                        "input": prompt,
                        "chat_history": chat_history_str
                    })
                    
                    answer = response.get('answer', "Sorry, I couldn't generate an answer.")
                    
                    # Citing sources implicitly by just telling them what documents were retrieved
                    # Langchain retrieval chain gives us 'context' which are the docs
                    # We can print source citations based on the retrieved docs metadata
                    
                    source_names = list(set([doc.metadata.get("source", "Unknown") for doc in response.get('context', [])]))
                    if source_names:
                        citations = "\\n\\n**Sources Checked:** " + ", ".join(source_names)
                        answer += citations
                    
                    st.markdown(answer)
                    st.session_state.messages.append({"role": "assistant", "content": answer})
                except Exception as e:
                    st.error(f"An error occurred: {e}")

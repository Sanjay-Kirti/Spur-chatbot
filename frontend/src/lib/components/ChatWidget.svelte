<script lang="ts">
  import { onMount, tick } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';
  import ChatInput from './ChatInput.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  import {
    messages,
    isLoading,
    error,
    isLoadingHistory,
    sendMessage,
    loadHistory,
    startNewChat,
  } from '$lib/stores/chat';

  let messagesContainer: HTMLDivElement | undefined = $state();

  const suggestedQuestions = [
    "What's your return policy?",
    "Do you ship internationally?",
    "What are your support hours?",
    "What payment methods do you accept?",
  ];

  async function scrollToBottom(smooth = true) {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
    }
  }

  function handleSend(text: string) {
    sendMessage(text);
  }

  function handleSuggestion(question: string) {
    sendMessage(question);
  }

  function dismissError() {
    error.set(null);
  }

  onMount(() => {
    const storedSessionId = localStorage.getItem('splur_session_id');
    if (storedSessionId) {
      loadHistory(storedSessionId).then(() => {
        scrollToBottom(false);
      });
    }
  });

  // Auto-scroll on new messages
  $effect(() => {
    // Access the store value to create dependency
    const _msgs = $messages;
    const _loading = $isLoading;
    scrollToBottom();
  });
</script>

<div class="chat-widget" id="chat-widget">
  <!-- Header -->
  <div class="chat-header">
    <div class="header-left">
      <div class="header-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1l-1 7H10l-1-7H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z"/>
          <circle cx="9" cy="7" r="1"/>
          <circle cx="15" cy="7" r="1"/>
        </svg>
      </div>
      <div class="header-info">
        <h2 class="header-title">Luna</h2>
        <span class="header-status">
          <span class="status-dot"></span>
          Lunara Support
        </span>
      </div>
    </div>
    <button
      class="new-chat-button"
      onclick={startNewChat}
      title="Start new conversation"
      id="new-chat-button"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="12" y1="8" x2="12" y2="14"/>
        <line x1="9" y1="11" x2="15" y2="11"/>
      </svg>
    </button>
  </div>

  <!-- Messages Area -->
  <div class="messages-area" bind:this={messagesContainer} id="messages-area">
    {#if $isLoadingHistory}
      <div class="loading-history">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>
    {:else if $messages.length === 0}
      <!-- Welcome State -->
      <div class="welcome-state">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1l-1 7H10l-1-7H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2V6a4 4 0 0 1 4-4z"/>
            <circle cx="9" cy="7" r="1"/>
            <circle cx="15" cy="7" r="1"/>
          </svg>
        </div>
        <h3 class="welcome-title">Hi there! 👋</h3>
        <p class="welcome-text">
          I'm Luna, your Lunara support assistant. I can help you with shipping, returns, payments, and more. What can I do for you today?
        </p>
        <div class="suggestions">
          {#each suggestedQuestions as question}
            <button
              class="suggestion-chip"
              onclick={() => handleSuggestion(question)}
              disabled={$isLoading}
            >
              {question}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Messages -->
      {#each $messages as message (message.id)}
        <MessageBubble {message} />
      {/each}
    {/if}

    {#if $isLoading}
      <TypingIndicator />
    {/if}
  </div>

  <!-- Error Banner -->
  {#if $error}
    <div class="error-banner" id="error-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="error-text">{$error}</span>
      <button class="error-dismiss" onclick={dismissError} aria-label="Dismiss error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  {/if}

  <!-- Input -->
  <ChatInput disabled={$isLoading} onsend={handleSend} />
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
    background: var(--color-surface);
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 25px 60px rgba(0, 0, 0, 0.15),
      0 0 0 1px var(--color-border);
  }

  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-avatar svg {
    width: 22px;
    height: 22px;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .header-title {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .header-status {
    font-size: 0.78rem;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #55efc4;
    box-shadow: 0 0 6px rgba(85, 239, 196, 0.6);
    animation: pulse 2s ease-in-out infinite;
  }

  .new-chat-button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.2s;
  }

  .new-chat-button:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  .new-chat-button svg {
    width: 18px;
    height: 18px;
  }

  /* Messages Area */
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }

  .messages-area::-webkit-scrollbar {
    width: 6px;
  }

  .messages-area::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-area::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  .messages-area::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-secondary);
  }

  /* Welcome State */
  .welcome-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    flex: 1;
    animation: fadeIn 0.5s ease-out;
  }

  .welcome-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: white;
  }

  .welcome-icon svg {
    width: 34px;
    height: 34px;
  }

  .welcome-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--color-text-primary);
  }

  .welcome-text {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    max-width: 340px;
    line-height: 1.6;
    margin: 0 0 24px;
  }

  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    max-width: 420px;
  }

  .suggestion-chip {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--color-border);
    background: var(--color-surface-elevated);
    color: var(--color-text-primary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .suggestion-chip:hover:not(:disabled) {
    border-color: var(--color-primary);
    background: rgba(108, 92, 231, 0.08);
    color: var(--color-primary);
    transform: translateY(-1px);
  }

  .suggestion-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Loading History */
  .loading-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex: 1;
    color: var(--color-text-secondary);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Error Banner */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(231, 76, 60, 0.08);
    border-top: 1px solid rgba(231, 76, 60, 0.2);
    color: #e74c3c;
    font-size: 0.85rem;
    animation: slideDown 0.3s ease-out;
  }

  .error-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .error-text {
    flex: 1;
  }

  .error-dismiss {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #e74c3c;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .error-dismiss:hover {
    background: rgba(231, 76, 60, 0.1);
  }

  .error-dismiss svg {
    width: 14px;
    height: 14px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>

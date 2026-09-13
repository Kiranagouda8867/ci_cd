/**
 * Speech Synthesis Utilities
 * Handles text-to-speech for detected equipment
 */

// Cache for voices to avoid repeated lookups
let cachedVoices = [];
let voicesLoaded = false;

/**
 * Initialize voices early (call on app mount)
 */
export function initializeVoices() {
  console.log('🎙️ Initializing voice synthesis...');
  ensureVoicesLoaded();
}

/**
 * Get available voices and ensure they're loaded
 * Uses onvoiceschanged fallback for browsers that load voices asynchronously
 */
function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    if (!synth) {
      console.error('❌ speechSynthesis not available');
      resolve([]);
      return;
    }

    // Try to get voices immediately
    cachedVoices = synth.getVoices();

    if (cachedVoices.length > 0) {
      voicesLoaded = true;
      console.log('✓ Voices already loaded. Available:', cachedVoices.length);
      resolve(cachedVoices);
      return;
    }

    console.log('📍 Voices not ready yet, waiting for onvoiceschanged event...');

    // If voices not loaded, wait for onvoiceschanged event
    const handleVoicesChanged = () => {
      cachedVoices = synth.getVoices();
      if (cachedVoices.length > 0) {
        voicesLoaded = true;
        synth.removeEventListener('voiceschanged', handleVoicesChanged);
        console.log('✓ Voices loaded via event. Available:', cachedVoices.length);
        console.log('Available voices:', cachedVoices.map(v => `${v.name} (${v.lang})`).join(', '));
        resolve(cachedVoices);
      }
    };

    synth.addEventListener('voiceschanged', handleVoicesChanged);

    // Timeout fallback (voices might load within 1000ms)
    setTimeout(() => {
      cachedVoices = synth.getVoices();
      if (cachedVoices.length > 0) {
        voicesLoaded = true;
        synth.removeEventListener('voiceschanged', handleVoicesChanged);
        console.log('✓ Voices loaded via timeout. Available:', cachedVoices.length);
      } else {
        console.warn('⚠️ No voices loaded even after timeout');
      }
      resolve(cachedVoices);
    }, 1000);
  });
}

/**
 * Get the best English voice available
 */
function getEnglishVoice(voices) {
  if (!voices || voices.length === 0) {
    return null;
  }

  // Try to find US English voice first
  let voice = voices.find(v => v.lang.includes('en-US'));
  
  // Fallback: any English voice
  if (!voice) {
    voice = voices.find(v => v.lang.includes('en'));
  }

  // Last resort: first available voice
  if (!voice) {
    voice = voices[0];
  }

  return voice;
}

/**
 * Speak given text using browser Text-to-Speech API
 * Ensures voices are loaded and handles browser autoplay restrictions
 * @param {string} text - Text to speak
 * @returns {Promise<boolean>} - True if speech started, false if failed
 */
export async function speak(text) {
  console.log('📢 speak() called with:', text);

  const synth = window.speechSynthesis;

  if (!synth) {
    console.error('❌ Speech Synthesis API not available in this browser');
    alert('⚠️ Speech Synthesis not supported in this browser');
    return false;
  }

  try {
    // Cancel any ongoing speech to prevent overlapping
    if (synth.speaking || synth.pending) {
      console.log('⏹️ Cancelling previous speech...');
      synth.cancel();
      // Small delay to ensure previous speech is fully cancelled
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Ensure voices are loaded
    console.log('⏳ Ensuring voices are loaded...');
    const voices = await ensureVoicesLoaded();

    if (voices.length === 0) {
      console.error('❌ No voices available in this browser');
      alert('⚠️ No voices available. Please check your browser audio settings.');
      return false;
    }

    // Get the best English voice
    const voice = getEnglishVoice(voices);
    console.log('✓ Using voice:', voice?.name, `(${voice?.lang})`);
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = 'en-US';
    utterance.rate = 0.9;  // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;  // Max volume

    console.log('🔧 Utterance config:', {
      voice: voice?.name,
      lang: utterance.lang,
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
      text: text
    });

    return new Promise((resolve) => {
      let speechStarted = false;
      let speechEnded = false;

      // Event listeners
      utterance.onstart = () => {
        speechStarted = true;
        console.log('🔊 Speech STARTED - Audio is playing now!');
        console.log('Browser audio context state:', synth);
      };

      utterance.onend = () => {
        speechEnded = true;
        console.log('✅ Speech ENDED');
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        console.error('Error details:', {
          error: event.error,
          speaking: synth.speaking,
          pending: synth.pending
        });
        resolve(false);
      };

      // Speak
      console.log('▶️ Calling synth.speak()...');
      console.log('System info - Browser:', navigator.userAgent);
      synth.speak(utterance);
      
      // Safety timeout to resolve promise if speech methods don't fire
      setTimeout(() => {
        if (!speechEnded && speechStarted) {
          console.log('⏱️ Speech completion timeout (assumed finished)');
          resolve(true);
        } else if (!speechStarted) {
          console.warn('⚠️ Speech did not start. Check browser permissions and volume.');
          resolve(false);
        }
      }, 8000);
    });
  } catch (error) {
    console.error('❌ Error in speak():', error);
    return false;
  }
}

/**
 * Test voice functionality
 * @returns {Promise<boolean>} - True if test speech succeeded
 */
export async function testVoice() {
  console.log('🧪 Testing voice...');
  alert('Testing voice... Listen carefully!');
  return await speak('Voice test successful. Detection announcements will work now.');
}

/**
 * Pluralize a word (simple rules)
 * @param {string} word - The word to pluralize
 * @param {number} count - The count
 * @returns {string} Pluralized word if count > 1
 */
function pluralize(word, count) {
  if (count === 1) return word;
  
  // Simple pluralization rules
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Generate a smart sentence with counts for duplicate objects
 * Groups objects by class and counts them
 * @param {Array<string>} detections - Array of class names (e.g., ["Nitrogen Tank", "Nitrogen Tank", "Fire Extinguisher"])
 * @returns {string} Natural language sentence with counts
 * 
 * Examples:
 * - [] → "No safety equipment detected"
 * - ["Fire Extinguisher"] → "Fire extinguisher detected"
 * - ["Nitrogen Tank", "Nitrogen Tank"] → "2 nitrogen tanks detected"
 * - ["Nitrogen Tank", "Nitrogen Tank", "Fire Extinguisher"] → "2 nitrogen tanks and fire extinguisher detected"
 * - ["Fire Ext", "Oxygen Tank", "Fire Ext", "First Aid"] → "2 fire extinguishers, oxygen tank and first aid detected"
 */
export function generateSmartSentence(detections) {
  // Handle no detections
  if (!detections || detections.length === 0) {
    return 'No safety equipment detected';
  }

  // Group detections by class name (case-insensitive)
  const grouped = {};
  detections.forEach(detection => {
    const lowerKey = detection.toLowerCase();
    grouped[lowerKey] = (grouped[lowerKey] || 0) + 1;
  });

  // Create array of formatted items with counts
  const items = Object.entries(grouped).map(([name, count]) => {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    
    if (count === 1) {
      return displayName;
    } else {
      // Pluralize the name
      const pluralized = pluralize(displayName, count);
      return `${count} ${pluralized}`;
    }
  });

  // Handle single item
  if (items.length === 1) {
    return `${items[0]} detected`;
  }

  // Handle multiple items - create natural language sentence
  const last = items[items.length - 1];
  const rest = items.slice(0, -1).join(', ');

  return `${rest} and ${last} detected`;
}

/**
 * Generate a natural language sentence from detection classes (LEGACY - use generateSmartSentence)
 * @param {Array<string>} detections - Array of class names (e.g., ["fire extinguisher", "oxygen tank"])
 * @returns {string} Natural language sentence
 * 
 * Examples:
 * - [] → "No safety equipment detected"
 * - ["fire extinguisher"] → "Fire extinguisher detected"
 * - ["fire extinguisher", "oxygen tank"] → "Fire extinguisher and oxygen tank detected"
 * - ["fire extinguisher", "oxygen tank", "first aid box"] → "Fire extinguisher, oxygen tank and first aid box detected"
 */
export function generateSentence(detections) {
  // Handle no detections
  if (!detections || detections.length === 0) {
    return 'No safety equipment detected';
  }

  // Handle single detection
  if (detections.length === 1) {
    return `${detections[0]} detected`;
  }

  // Handle multiple detections
  const last = detections[detections.length - 1];
  const rest = detections.slice(0, -1).join(', ');

  return `${rest} and ${last} detected`;
}

/**
 * Combined function: Generate smart sentence and speak it
 * Groups duplicates by class and announces counts
 * @param {Array<string>} detections - Array of class names
 * @returns {Promise<boolean>} - True if speech succeeded, false if failed
 */
export async function speakDetections(detections) {
  const sentence = generateSmartSentence(detections);
  console.log('📢 Speaking:', sentence);
  const success = await speak(sentence);
  return success;
}

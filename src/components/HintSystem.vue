<template>
  <q-dialog v-model="showHintDialog" position="bottom">
    <q-card class="hint-card">
      <q-card-section class="hint-header">
        <div class="hint-title">
          <q-icon name="lightbulb" color="orange" size="24px" />
          <span>Need a Hint?</span>
        </div>
        <q-btn flat round icon="close" @click="closeDialog" />
      </q-card-section>
      
      <q-card-section class="hint-content">
        <div class="hint-options">
          <div 
            class="hint-option"
            :class="{ 'hint-disabled': userProgress.gems < 20 }"
            @click="useRevealLetterHint"
          >
            <div class="hint-icon">
              <q-icon name="text_fields" size="30px" color="blue" />
            </div>
            <div class="hint-details">
              <div class="hint-name">Reveal Letter</div>
              <div class="hint-description">Show one letter in the crossword</div>
            </div>
            <div class="hint-cost">
              <q-icon name="diamond" color="blue" />
              <span>20</span>
            </div>
          </div>
          
          <div 
            class="hint-option"
            :class="{ 'hint-disabled': userProgress.gems < 50 }"
            @click="useRevealWordHint"
          >
            <div class="hint-icon">
              <q-icon name="quiz" size="30px" color="green" />
            </div>
            <div class="hint-details">
              <div class="hint-name">Word Hint</div>
              <div class="hint-description">Show the first letter of a word</div>
            </div>
            <div class="hint-cost">
              <q-icon name="diamond" color="blue" />
              <span>50</span>
            </div>
          </div>
          
          <div 
            class="hint-option"
            :class="{ 'hint-disabled': userProgress.gems < 100 }"
            @click="useShuffleHint"
          >
            <div class="hint-icon">
              <q-icon name="shuffle" size="30px" color="purple" />
            </div>
            <div class="hint-details">
              <div class="hint-name">Smart Shuffle</div>
              <div class="hint-description">Rearrange letters optimally</div>
            </div>
            <div class="hint-cost">
              <q-icon name="diamond" color="blue" />
              <span>100</span>
            </div>
          </div>
        </div>
        
        <div class="gem-balance">
          <q-icon name="diamond" color="blue" size="20px" />
          <span>You have {{ userProgress.gems }} gems</span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Hint Result Dialog -->
  <q-dialog v-model="showHintResult" no-backdrop-dismiss>
    <q-card class="hint-result-card">
      <q-card-section class="text-center">
        <q-icon 
          :name="hintResult.icon" 
          :color="hintResult.color" 
          size="50px" 
          class="hint-result-icon"
        />
        <div class="hint-result-title">{{ hintResult.title }}</div>
        <div class="hint-result-message">{{ hintResult.message }}</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useGameStore } from '../stores/game-store'

interface Props {
  modelValue: boolean
  targetWords?: string[]
  foundWords?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'hint-used', type: string, data?: unknown): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const gameStore = useGameStore()
const { userProgress } = gameStore

const showHintDialog = ref(props.modelValue)
const showHintResult = ref(false)

const hintResult = reactive({
  title: '',
  message: '',
  icon: '',
  color: ''
})

const closeDialog = () => {
  emit('update:modelValue', false)
}

const showHintResultDialog = (title: string, message: string, icon: string, color: string) => {
  hintResult.title = title
  hintResult.message = message
  hintResult.icon = icon
  hintResult.color = color
  showHintResult.value = true
  
  setTimeout(() => {
    showHintResult.value = false
  }, 2000)
}

const useRevealLetterHint = async () => {
  if (userProgress.gems < 20) {
    showHintResultDialog(
      'Not Enough Gems!', 
      'You need 20 gems to reveal a letter', 
      'error', 
      'red'
    )
    return
  }
  
  if (await gameStore.useHint()) {
    // Find a random unrevealed word
    const unrevealedWords = props.targetWords?.filter(word => 
      !props.foundWords?.includes(word)
    ) || []
    
    if (unrevealedWords.length > 0) {
      const randomWord = unrevealedWords[Math.floor(Math.random() * unrevealedWords.length)]
      if (randomWord) {
        const randomLetterIndex = Math.floor(Math.random() * randomWord.length)
        
        emit('hint-used', 'reveal-letter', {
          word: randomWord,
          letterIndex: randomLetterIndex,
          letter: randomWord[randomLetterIndex]
        })
        
        showHintResultDialog(
          'Letter Revealed!', 
          `Found letter "${randomWord[randomLetterIndex]}" in "${randomWord}"`, 
          'check_circle', 
          'green'
        )
      }
    }
  }
  
  closeDialog()
}

const useRevealWordHint = () => {
  if (userProgress.gems < 50) {
    showHintResultDialog(
      'Not Enough Gems!', 
      'You need 50 gems for a word hint', 
      'error', 
      'red'
    )
    return
  }
  
  if (userProgress.gems >= 50) {
    userProgress.gems -= 50
    
    const unrevealedWords = props.targetWords?.filter(word => 
      !props.foundWords?.includes(word)
    ) || []
    
    if (unrevealedWords.length > 0) {
      const randomWord = unrevealedWords[Math.floor(Math.random() * unrevealedWords.length)]
      
      if (randomWord) {
        emit('hint-used', 'word-hint', {
          word: randomWord,
          firstLetter: randomWord[0]
        })
        
        showHintResultDialog(
          'Word Hint!', 
          `This word starts with "${randomWord[0]}" and has ${randomWord.length} letters`, 
          'quiz', 
          'green'
        )
      }
    }
  }
  
  closeDialog()
}

const useShuffleHint = () => {
  if (userProgress.gems < 100) {
    showHintResultDialog(
      'Not Enough Gems!', 
      'You need 100 gems for smart shuffle', 
      'error', 
      'red'
    )
    return
  }
  
  if (userProgress.gems >= 100) {
    userProgress.gems -= 100
    
    emit('hint-used', 'smart-shuffle')
    
    showHintResultDialog(
      'Smart Shuffle!', 
      'Letters have been optimally rearranged', 
      'shuffle', 
      'purple'
    )
  }
  
  closeDialog()
}
</script>

<style scoped>
.hint-card {
  border-radius: 20px 20px 0 0;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.hint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.hint-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.hint-content {
  padding: 20px;
}

.hint-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.hint-option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.hint-option:hover:not(.hint-disabled) {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.hint-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.hint-details {
  flex: 1;
}

.hint-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.hint-description {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.3;
}

.hint-cost {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #333;
  background: white;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.gem-balance {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 15px;
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
  border-radius: 12px;
  font-weight: 500;
  color: #1976d2;
}

.hint-result-card {
  border-radius: 15px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  max-width: 300px;
  margin: 0 auto;
}

.hint-result-icon {
  margin-bottom: 15px;
  animation: bounceIn 0.6s ease-out;
}

.hint-result-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.hint-result-message {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .hint-option {
    padding: 12px;
    gap: 12px;
  }
  
  .hint-icon {
    width: 45px;
    height: 45px;
  }
  
  .hint-name {
    font-size: 0.9rem;
  }
  
  .hint-description {
    font-size: 0.8rem;
  }
}
</style>
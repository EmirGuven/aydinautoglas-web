<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

const model = defineModel<string>({ default: '' })

const editor = useEditor({
  content: model.value,
  extensions: [StarterKit],
  onUpdate: ({ editor: instance }) => {
    model.value = instance.getHTML()
  },
})

watch(model, (value) => {
  if (editor.value && value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

function toggle(command: 'toggleBold' | 'toggleItalic' | 'toggleBulletList' | 'toggleOrderedList') {
  editor.value?.chain().focus()[command]().run()
}
</script>

<template>
  <div class="rounded-md border border-slate-300 dark:border-slate-600">
    <div class="flex gap-1 border-b border-slate-200 p-1 dark:border-slate-700">
      <button type="button" class="min-h-9 rounded px-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700" @click="toggle('toggleBold')">
        B
      </button>
      <button type="button" class="min-h-9 rounded px-2 text-sm italic hover:bg-slate-100 dark:hover:bg-slate-700" @click="toggle('toggleItalic')">
        I
      </button>
      <button type="button" class="min-h-9 rounded px-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" @click="toggle('toggleBulletList')">
        &bull; List
      </button>
      <button type="button" class="min-h-9 rounded px-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700" @click="toggle('toggleOrderedList')">
        1. List
      </button>
    </div>
    <EditorContent :editor="editor" class="prose prose-sm max-w-none px-3 py-2 text-slate-900 dark:text-slate-100 [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none" />
  </div>
</template>

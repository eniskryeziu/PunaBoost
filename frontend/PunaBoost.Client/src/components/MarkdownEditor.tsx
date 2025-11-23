import { lazy, Suspense, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Lazy load MDXEditor to ensure client-side only rendering
const MDXEditor = lazy(() => 
  import('@mdxeditor/editor').then((module) => {
    // Import CSS
    import('@mdxeditor/editor/style.css');
    return { default: module.MDXEditor };
  })
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your job description...',
  disabled = false,
  className,
  rows: _rows = 12,
}: MarkdownEditorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Suspense fallback={
        <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      }>
        <MDXEditorWrapper
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </Suspense>
      <p className="text-xs text-muted-foreground">
        Use the toolbar above to format your text. You can also use Markdown shortcuts like **bold**, *italic*, `code`, etc.
      </p>
    </div>
  );
}

function MDXEditorWrapper({ value, onChange, placeholder, disabled }: Omit<MarkdownEditorProps, 'className' | 'rows'>) {
  // Import plugins dynamically
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    import('@mdxeditor/editor').then((module) => {
      const {
        headingsPlugin,
        listsPlugin,
        quotePlugin,
        thematicBreakPlugin,
        markdownShortcutPlugin,
        linkPlugin,
        linkDialogPlugin,
        tablePlugin,
        codeBlockPlugin,
        codeMirrorPlugin,
        diffSourcePlugin,
        frontmatterPlugin,
        toolbarPlugin,
        UndoRedo,
        BoldItalicUnderlineToggles,
        ListsToggle,
        BlockTypeSelect,
        CreateLink,
        InsertTable,
        InsertCodeBlock,
        InsertThematicBreak,
      } = module;

      setPlugins([
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
        codeMirrorPlugin({ 
          codeBlockLanguages: { 
            js: 'JavaScript', 
            ts: 'TypeScript', 
            jsx: 'JSX', 
            tsx: 'TSX', 
            css: 'CSS', 
            html: 'HTML', 
            json: 'JSON', 
            txt: 'Plain Text' 
          } 
        }),
        markdownShortcutPlugin(),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
        frontmatterPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <ListsToggle />
              <CreateLink />
              <InsertTable />
              <InsertCodeBlock />
              <InsertThematicBreak />
            </>
          ),
        }),
      ]);
    });
  }, []);

  if (plugins.length === 0) {
    return (
      <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <MDXEditor
        markdown={value || ''}
        onChange={onChange}
        contentEditableClassName="prose prose-sm max-w-none dark:prose-invert min-h-[300px] p-4 focus:outline-none"
        placeholder={placeholder}
        readOnly={disabled}
        plugins={plugins}
      />
    </div>
  );
}

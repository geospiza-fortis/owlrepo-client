<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";

  export let value = "";
  export let schema = {};

  const dispatch = createEventDispatcher();
  let editorElement;
  let view;

  export function setValue(newValue) {
    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: newValue },
      });
    }
  }

  onMount(async () => {
    // Dynamic imports to avoid SSR issues
    const [
      { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars },
      { EditorState },
      { sql, SQLDialect },
      { autocompletion },
      { defaultKeymap, history, historyKeymap },
      { oneDark },
    ] = await Promise.all([
      import("@codemirror/view"),
      import("@codemirror/state"),
      import("@codemirror/lang-sql"),
      import("@codemirror/autocomplete"),
      import("@codemirror/commands"),
      import("@codemirror/theme-one-dark"),
    ]);

    // Build schema completion from DuckDB schema
    const schemaCompletion = {};
    for (const [table, cols] of Object.entries(schema)) {
      schemaCompletion[table] = cols.map((c) => c.name);
    }

    const duckDBDialect = SQLDialect.define({
      keywords:
        "select from where group by order limit offset as join left right inner outer on and or not in is null like between union all distinct having count sum avg min max cast create table view insert into values delete update set drop alter index exists if replace with recursive case when then else end asc desc true false",
      types:
        "integer bigint double float real varchar text boolean date timestamp blob hugeint",
    });

    const runKeymap = keymap.of([
      {
        key: "Ctrl-Enter",
        run: () => {
          dispatch("run");
          return true;
        },
      },
      {
        key: "Mod-Enter",
        run: () => {
          dispatch("run");
          return true;
        },
      },
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        value = update.state.doc.toString();
      }
    });

    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightSpecialChars(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          sql({ dialect: duckDBDialect, schema: schemaCompletion }),
          autocompletion(),
          oneDark,
          runKeymap,
          updateListener,
          EditorView.lineWrapping,
        ],
      }),
      parent: editorElement,
    });
  });

  onDestroy(() => {
    if (view) view.destroy();
  });
</script>

<div class="editor-wrapper" bind:this={editorElement}></div>

<style>
  .editor-wrapper {
    border: 1px solid #444;
    border-radius: 4px;
    overflow: hidden;
  }
  .editor-wrapper :global(.cm-editor) {
    min-height: 150px;
    max-height: 500px;
    font-size: 14px;
  }
  .editor-wrapper :global(.cm-scroller) {
    overflow: auto;
  }
</style>

(() => {
    const list = document.getElementById("tsnip-list")
    const editor = document.getElementById("tsnip-editor")
    const storageKey = "tsnip"
    const heartbeat = 1000

    let currentSnip = null

    function load_snip(snip) {
        list.childNodes.forEach(el => {
            el.classList = []
        })
        currentSnip = snip

        if (snip != null) {
            editor.value = atob(currentSnip.dataset.store)
            currentSnip.classList = ['current']
        } else {
            editor.value = ""
        }
        autosaveCache = editor.value
    }

    function delete_current_snip() {
        if (currentSnip != null) {
            list.removeChild(currentSnip)
        }
        load_snip(null)
        editor.focus()
        enableSnippetButtons(false)
    }

    function save_editor() {
        if (editor.value == null || editor.value == "") {
            delete_current_snip()
            return -1
        }

        const data = btoa(editor.value)
        if (currentSnip != null) {
            currentSnip.dataset.store = data
        } else {
            let title = editor.value.slice(0,64)
            if (title.indexOf('\n') >= 0) {
                title = title.slice(0,title.indexOf('\n'))
            }
            let nmi = make_li(Date.now(), title, data)
            list.appendChild(nmi)
            load_snip(nmi)
            enableSnippetButtons(true)
        }

        save_to_storage(storageKey)

        return 1
    }

    /**
     * Creates a list element for a snippet
     * @param {string} id 
     * @param {string} title 
     * @param {string} store 
     * @returns 
     */
    function make_li(id, title, store) {
        let li = document.createElement('li')
        li.dataset.store = store
        li.dataset.key = btoa(`l-${id}`)
        li.innerText = title
        li.contentEditable = true
        li.spellcheck = false
        li.onkeydown = e => {
            if (e.key == 'Enter' || e.code == 'Enter' || e.key == 'Tab' || e.code == "Tab") {
                e.preventDefault()
                save_to_storage(storageKey)
                editor.focus()
            }
        }
        li.onclick = e => {
            save_editor()
            load_snip(li)
            enableSnippetButtons(true)
        }
        return li
    }
    
    /**
     * Insert tabs into editor
     * @param {event} e 
     */
    editor.onkeydown = (e) => {
        if (e.key == 'Tab' || e.code == "Tab") {
            e.preventDefault()
            let si = editor.selectionStart
            editor.value = editor.value.slice(0,si) + '    ' + editor.value.slice(si)
            editor.selectionStart = editor.selectionEnd = si + 4
        }
    }

    /**
     * Editor autosave
     */
    let autosave = null;
    let autosaveCache = ""
    editor.onkeyup = (e) => {
        if (autosaveCache == editor.value) {
            return;
        }
        if (autosave != null) {
            clearTimeout(autosave)
        }
        autosave = setTimeout(() => {
            if (save_editor() < 0) {
                deleteNotification.start()
            } else {
                saveNotification.start()
            }
            autosaveCache = editor.value
        }, heartbeat);
    }

    const newButtons = new ButtonType('new', () => {
        save_editor()
        load_snip(null)
        enableSnippetButtons(false)
    })

    const deleteButtons = new ButtonType("delete", () => {
        if (confirm("Are you sure you want to delete this snippet? This cannot be undone.")) {
            delete_current_snip()
            deleteNotification.start()
        } else {
            editor.focus()
        }
    })

    const shareButtons = new ButtonType("share", () => {
        let link = "//" + window.location.host + window.location.pathname;
        link += "?i="+ btoa(JSON.stringify({
            key: currentSnip.dataset.key,
            store: currentSnip.dataset.store,
            title: currentSnip.innerText
        }))
        navigator.clipboard.writeText(link)
        linkCopiedNotification.start()
    })

    const copyButtons = new ButtonType("copy", () => {
        navigator.clipboard.writeText(editor.value)
        snippetCopiedNotification.start()
    })

    function enableSnippetButtons(val) {
        deleteButtons.setEnabled(val)
        shareButtons.setEnabled(val)
        copyButtons.setEnabled(val)
    }

    /**
     * Load snippets from local storage
     */
    const saved = localStorage.getItem(storageKey)
    if (saved) {
        const jsave = JSON.parse(saved)
        for(let o of jsave) {
            list.appendChild(make_li(o.key, o.title, o.store))
        }
    }

    /**
     * Imports a snippet from a link
     */
    const params = new URLSearchParams(window.location.search)
    if (params.has('i')) {
        let snip = params.get('i')
        snip = atob(snip)
        snip = JSON.parse(snip)
        if (snip) {
            let nli = make_li(snip.key, snip.title + '[imported]', snip.store)
            list.appendChild(nli)
            load_snip(nli)
            enableSnippetButtons(true)
            snippetImportedNotification.start()
        }
        window.history.replaceState({}, document.title, "//" + window.location.host + window.location.pathname)
    }
})()

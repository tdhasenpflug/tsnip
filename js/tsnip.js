(() => {
    const list = document.getElementById("tsnip-list")
    const editor = document.getElementById("tsnip-editor")
    const newButtons = document.getElementsByClassName("tsnip-new")
    const deleteButtons = document.getElementsByClassName("tsnip-delete")
    const saveLabel = document.getElementById("tsnip-save-label")

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
    }

    function delete_current_snip() {
        if (currentSnip != null) {
            list.removeChild(currentSnip)
        }
        load_snip(null)
        editor.focus()

        if (list.childNodes.length > 0) {
            deleteButtonVisibility(true)
        } else {
            deleteButtonVisibility(false)
        }
    }

    function deleteButtonVisibility(val) {
        if (val) {
            Array.from(deleteButtons).forEach(bt => {
                bt.setAttribute('style', 'visibility:visible')
            })
        } else {
            Array.from(deleteButtons).forEach(bt => {
                bt.setAttribute('style', 'visibility:hidden')
            })
        }
    }

    function get_snippets_data() {
        let s = []
        list.childNodes.forEach(c => {
            s.push({
                key: c.dataset.key,
                store: c.dataset.store,
                title: c.innerText
            })
        })
        return s
    }

    let saveLabelDelay = null
    function start_save_label() {
        saveLabel.setAttribute('style', 'visibility:visible')
        if (saveLabelDelay != null) {
            clearTimeout(saveLabelDelay)
        }
        saveLabelDelay = setTimeout(() => {
            saveLabel.setAttribute('style', 'visibility:hidden')
        }, 3000);
    }

    function save_to_storage() {
        let s = get_snippets_data()
        if (s.length < 1) {
            localStorage.removeItem(storageKey)
        } else {
            localStorage.setItem(storageKey, JSON.stringify(s))
        }
    }

    function save_editor() {
        if (editor.value == null || editor.value == "") {
            delete_current_snip()
            return
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
            deleteButtonVisibility(true)
        }

        save_to_storage()
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
                save_to_storage()
                editor.focus()
            }
        }
        li.onclick = e => {
            save_editor()
            load_snip(li)
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
    editor.onkeyup = (e) => {
        if (autosave != null) {
            clearTimeout(autosave)
        }
        autosave = setTimeout(() => {
            save_editor()
            start_save_label()
        }, heartbeat);
    }

    /**
     * Set up + New Snippet buttons
     */
    Array.from(newButtons).forEach(b => {
        b.onclick = () => {
            save_editor()
            load_snip(null)
        }
    })

    /**
     * Set up delete buttons
     */
    Array.from(deleteButtons).forEach(b => {
        b.onclick = () => {
            if (confirm("Are you sure you want to delete this snippet? This cannot be undone.")) {
                delete_current_snip()
            } else {
                editor.focus()
            }
        }
    })

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

    if (list.childNodes.length > 0) {
        load_snip(list.lastChild)
        deleteButtonVisibility(true)
    } else {
        deleteButtonVisibility(false)
    }

})()

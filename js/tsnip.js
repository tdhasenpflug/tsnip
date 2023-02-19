(() => {
    const list = document.getElementById("tsnip-list")
    const editor = document.getElementById("tsnip-editor")
    const newButtons = document.getElementsByClassName("tsnip-new")
    const deleteButtons = document.getElementsByClassName("tsnip-delete")

    const storageKey = "tsnip"
    const heartbeat = 1000

    let currentSnip = null;

    function save_to_storage() {
        let s = []
        list.childNodes.forEach(c => {
            s.push({
                key: c.dataset.key,
                store: c.dataset.store
            })
        })
        if (s.length < 1) {
            localStorage.removeItem(storageKey)
        } else {
            localStorage.setItem(storageKey, JSON.stringify(s))
        }
    }

    function save_editor() {
        if (editor.value == null || editor.value == "") {
            let ni = 0
            if (currentSnip != null) {
                ni = Array.from(list.childNodes).indexOf(currentSnip)
                list.removeChild(currentSnip)
                editor.value = ""
                currentSnip = null
                if (ni > list.childNodes.length - 1) {
                    ni = list.childNodes.length - 1
                }
            }
            if (list.childNodes.length > 0) {
                currentSnip = list.childNodes.item(ni)
                editor.value = atob(currentSnip.dataset.store)
                currentSnip.classList = ['current']
                Array.from(deleteButtons).forEach(bt => {
                    bt.setAttribute('style', 'visibility:visible')
                })
            } else {
                Array.from(deleteButtons).forEach(bt => {
                    bt.setAttribute('style', 'visibility:hidden')
                })
            }
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
            let nmi = make_li(make_key(title), title, data)
            list.appendChild(nmi)
            currentSnip = nmi
            list.childNodes.forEach(el => {
                el.classList = []
            })
            nmi.classList = ['current']
        }

        save_to_storage()
    }

    function make_key(decoded_key) {
        return btoa(decoded_key + '-' + Date.now())
    }

    function remove_key_tag(encoded_key) {
        let s = atob(encoded_key)
        return s.slice(0, s.lastIndexOf('-'))
    }

    function make_li(key, title, store) {
        let li = document.createElement('li')
        li.dataset.store = store
        li.dataset.key = key
        li.innerText = title
        li.contentEditable = true
        li.spellcheck = false

        let liautosave = null
        li.onkeyup = function(e) {
            li.dataset.key = make_key(li.innerText)
            if (liautosave != null) {
                clearTimeout(liautosave)
            }
            liautosave = setTimeout(() => {
                save_to_storage()
            }, heartbeat);
        }
        li.onclick = function(e) {
            save_editor()
            list.childNodes.forEach(el => {
                el.classList = []
            })
            li.classList = ['current']
            currentSnip = this
            editor.value = atob(this.dataset.store)
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
            editor.value = editor.value.slice(0,si) + '\t' + editor.value.slice(si)
            editor.selectionStart = editor.selectionEnd = si + 1
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
        autosave = setTimeout(save_editor, heartbeat);
    }

    /**
     * Set up + New Snippet buttons
     */
    Array.from(newButtons).forEach(b => {
        b.onclick = () => {
            save_editor()
            currentSnip = null
            editor.value = ""
            list.childNodes.forEach(el => {
                el.classList = []
            })
        }
    })

    /**
     * Set up delete buttons
     */
    Array.from(deleteButtons).forEach(b => {
        b.onclick = () => {
            list.removeChild(currentSnip)
            currentSnip = null
            editor.value = ""
            save_to_storage()

            if (list.childNodes.length > 0) {
                currentSnip = list.firstChild
                editor.value = atob(currentSnip.dataset.store)
                currentSnip.classList = ['current']
                Array.from(deleteButtons).forEach(bt => {
                    bt.setAttribute('style', 'visibility:visible')
                })
            } else {
                Array.from(deleteButtons).forEach(bt => {
                    bt.setAttribute('style', 'visibility:hidden')
                })
            }

            save_editor()
        }
    })

    /**
     * Load snippets from local storage
     */
    const saved = localStorage.getItem(storageKey)
    if (saved) {
        const jsave = JSON.parse(saved)
        for(let o of jsave) {
            let li = make_li(o.key, remove_key_tag(o.key), o.store || "")
            list.appendChild(li)
        }
    }

    if (list.childNodes.length > 0) {
        currentSnip = list.firstChild
        editor.value = atob(currentSnip.dataset.store)
        currentSnip.classList = ['current']
        Array.from(deleteButtons).forEach(bt => {
            bt.setAttribute('style', 'visibility:visible')
        })
    } else {
        Array.from(deleteButtons).forEach(bt => {
            bt.setAttribute('style', 'visibility:hidden')
        })
    }

})()

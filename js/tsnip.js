(() => {
    const list = document.getElementById("tsnip-list")
    const editor = document.getElementById("tsnip-editor")
    const newButton = document.getElementById("tsnip-new")

    const storageKey = "tsnip";

    const current = {
        snippet: null,
        dct: null
    }

    function save_to_storage() {
        let s = []
        list.childNodes.forEach(c => {
            s.push({
                key: c.dataset.key,
                store: c.dataset.store
            })
        })
        console.log(s)
        localStorage.setItem(storageKey, JSON.stringify(s))
    }

    function save_editor() {
        if (editor.value == null || editor.value == "") {
            return
        }
        const data = btoa(editor.value)

        if (current.snippet != null) {
            current.snippet.dataset.store = data
        } else {
            let nmi = make_li(make_key('New TSnip'), editor.value.slice(0,64), data)
            list.appendChild(nmi)
            current.snippet = nmi
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
        console.log(s)
        s = s.slice(0, s.lastIndexOf('-'))
        console.log(s)
        return s
    }

    function make_li(key, title, store) {
        let li = document.createElement('li')
        li.dataset.store = store
        li.dataset.key = key
        li.innerHTML = title
        li.contentEditable = true
        li.spellcheck = false
        li.onclick = function(e) {
            list.childNodes.forEach(el => {
                el.classList = []
            })
            li.classList = ['current']
            save_editor()
            current.snippet = this
            editor.value = atob(this.dataset.store)
        }
        li.onkeyup = function(e) {
            this.dataset.key = make_key(li.innerHTML)
            save_to_storage()
        }
        return li
    }
    
    editor.onkeydown = (e) => {
        if (e.key == 'Tab' || e.code == "Tab") {
            e.preventDefault()
            let si = editor.selectionStart
            editor.value = editor.value.slice(0,si) + '\t' + editor.value.slice(si)
            editor.selectionStart = editor.selectionEnd = si + 1
        }
    }
    let doSave = null;
    editor.onkeyup = (e) => {
        if (doSave != null) {
            clearTimeout(doSave)
        }
        doSave = setTimeout(save_editor, 1500);
    }

    newButton.onclick = () => {
        current.snippet = null
        editor.value = ""
    }


    // on load
    const saved = localStorage.getItem(storageKey)
    console.log(saved)
    if (saved) {
        const jsave = JSON.parse(saved)
        for(let o of jsave) {
            console.log(o)
            let li = make_li(o.key, remove_key_tag(o.key), o.store || "")
            list.appendChild(li)
        }
        current.snippet = list.lastChild
        editor.value = atob(current.snippet.dataset.store)
        
        list.lastChild.classList = ['current']
    }

})()

function decode_id(key) {
    return atob(key).slice(key.lastIndexOf('-')+1)
}

function save_location(key) {
    let l = atob(key).slice(0,key.lastIndexOf('-'))
    if (l == 'c') {
        return 'cloud'
    }
    return 'local'
}

function get_snippets_data(location) {
    const list = document.getElementById("tsnip-list")
    let s = []
    list.childNodes.forEach(c => {
        if (save_location(c.dataset.key) == location) {
            s.push({
                key: c.dataset.key,
                store: c.dataset.store,
                title: c.innerText
            })
        }
    })
    return s
}

/**
 * Save all the local snippets to local storage.
 */
function save_to_storage(storageKey) {
    let s = get_snippets_data('local')
    if (s.length < 1) {
        localStorage.removeItem(storageKey)
    } else {
        localStorage.setItem(storageKey, JSON.stringify(s))
    }
}


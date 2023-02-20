function ButtonType(type, onclick) {
    const buttons = document.getElementsByClassName(`tsnip-${type}`)

    Array.from(buttons).forEach(b => {
        b.onclick = onclick
    })

    this.setEnabled = enabled => {
        if (enabled) {
            Array.from(buttons).forEach(b => {
                b.removeAttribute('disabled')
            })
        } else {
            Array.from(buttons).forEach(b => {
                b.setAttribute('disabled', 'disabled')
            })
        }
    }
}


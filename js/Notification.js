const notifications = document.getElementById("tsnip-notifications")
function Notification(text, type) {
    const el = document.createElement("span")
    el.innerText = text
    if (['danger','warn','success'].indexOf(type) > -1) {
        el.classList = [type]
    }

    let delay = null

    this.start = (duration) => {
        notifications.appendChild(el)
        if (delay != null) {
            clearTimeout(delay)
        }
        delay = setTimeout(() => {
            notifications.removeChild(el)
        }, duration || 3000);
    }
}

const saveNotification = new Notification("Saved!", 'success')
const deleteNotification = new Notification("Deleted.", 'danger')
const uploadNotification = new Notification("Uploaded!", 'success')
const signedInNotification = new Notification("Signed in successfully!", 'success')
const signInErrorNotification = new Notification("Could not sign in.", 'warn')
const linkCopiedNotification = new Notification("Link copied.")
const snippetCopiedNotification = new Notification("Snippet copied.")
const snippetImportedNotification = new Notification("Snippet imported.", 'success')
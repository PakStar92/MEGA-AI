// SimpleStore.js
import fs from 'fs';

class SimpleStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      chats: {},
      messages: {},
      contacts: {},
    };
  }

  readFromFile() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        if (raw.trim().length === 0) {
          console.warn('[Store] File is empty. Initializing with default structure.');
          return;
        }
        this.data = JSON.parse(raw);
        console.log('[Store] Loaded from file.');
      } catch (err) {
        console.error('[Store] Failed to read from file:', err);
      }
    }
  }

  writeToFile() {
    try {
      const tmpPath = this.filePath + '.tmp';
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2));
      fs.renameSync(tmpPath, this.filePath);
      console.log('[Store] Written to file.');
    } catch (err) {
      console.error('[Store] Failed to write to file:', err);
    }
  }

  saveMessage(message) {
    this.data.messages[message.key.id] = message;
  }

  saveChat(chat) {
    this.data.chats[chat.id] = chat;
  }

  saveContact(contact) {
    this.data.contacts[contact.id] = contact;
  }

  bind(ev) {
    ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        this.saveMessage(msg);
      }
    });

    ev.on('chats.set', ({ chats }) => {
      for (const chat of chats) {
        this.saveChat(chat);
      }
    });

    ev.on('contacts.update', (updates) => {
      for (const contact of updates) {
        this.saveContact(contact);
      }
    });

    console.log('[Store] Bound to Baileys event stream.');
  }
}

const store = new SimpleStore('./baileys_store.json');
store.readFromFile();

setInterval(() => {
  store.writeToFile();
}, 10_000);

// 👇 Export the initialized store
export default store;

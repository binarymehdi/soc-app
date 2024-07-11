import asyncio
from telethon import TelegramClient
import os
import json
import sqlite3
import shutil
import subprocess
from datetime import datetime, timedelta
from telethon.tl.functions.channels import JoinChannelRequest, GetFullChannelRequest
from telethon.tl.types import MessageMediaDocument
from tqdm import tqdm
import chardet
import pyzipper
import zipfile

LIMIT = 1

# Replace these with your own values
api_id = '27201032'
api_hash = '1e6899a5e0bb179509ea228f42fb5831'
phone_number = '+212661293731'
# List of target channels
target_channels = ['OBSERVERCLOUDCHAT']  # Add the usernames of target channels

# Create the client and connect
client = TelegramClient('anon', api_id, api_hash)

# SQLite database setup
db_path = 'passwords.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create the table if it does not exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS passwords (
    browser TEXT,
    profile TEXT,
    url TEXT,
    login TEXT,
    password TEXT,
    country TEXT
)
''')
cursor.execute('''
CREATE TABLE IF NOT EXISTS last_message_ids (
    channel TEXT PRIMARY KEY,
    last_id INTEGER
)
''')
conn.commit()

session_file = '/code/anon.session-journal'

os.makedirs(os.path.dirname(session_file), exist_ok=True)

with open(session_file, 'a'):
    os.utime(session_file, None)

# Load the last message IDs from the database
last_message_ids = {channel: 0 for channel in target_channels}
for channel in target_channels:
    cursor.execute('SELECT last_id FROM last_message_ids WHERE channel = ?', (channel,))
    row = cursor.fetchone()
    if row:
        last_message_ids[channel] = row[0]


async def download_media_with_progress(message, file_path, chunk_size=256 * 1024):  # Default chunk size is 256KB
    size = message.media.document.size
    with tqdm(total=size, unit='B', unit_scale=True, desc=file_path, ascii=True) as pbar:
        async for chunk in client.iter_download(message.media, request_size=chunk_size):
            with open(file_path, 'ab') as f:
                f.write(chunk)
            pbar.update(len(chunk))


def detect_file_encoding(file_path):
    with open(file_path, 'rb') as f:
        raw_data = f.read()
    result = chardet.detect(raw_data)
    encoding = result['encoding']
    if encoding is None or encoding.lower() not in ['utf-8', 'ascii', 'latin-1']:
        encoding = 'utf-8'
    return encoding


def extract_pass(message):
    lines = message.splitlines()
    for line in lines:
        if "👁 PASS:" in line:
            password_index = line.index("👁 PASS:") + len("👁 PASS:")
            password = line[password_index:].strip()
            return password
    return None


def extract_and_find_passwords(file_path, extract_dir, passcode=None):
    extracted_passwords = []

    try:
        if file_path.endswith('.zip'):
            with pyzipper.AESZipFile(file_path) as zip_ref:
                zip_ref.pwd = passcode.encode() if passcode else None
                zip_ref.extractall(extract_dir)
        elif file_path.endswith('.rar'):
            try:
                cmd = ['unrar', 'x', '-o+', file_path, extract_dir]
                if passcode:
                    cmd.insert(-2, f'-p{passcode}')
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"Error extracting {file_path}: {result.stderr}")
            except Exception as e:
                print(f"Exception while extracting {file_path}: {str(e)}")
    except (zipfile.BadZipFile, pyzipper.zipfile.BadZipFile):
        print(f"File {file_path} is not a valid zip file. Skipping extraction.")
        return extracted_passwords

    for root, dirs, files in os.walk(extract_dir):
        country = None
        if 'system_info.txt' in files:
            system_info_path = os.path.join(root, 'system_info.txt')
            encoding = detect_file_encoding(system_info_path)
            with open(system_info_path, 'r', encoding=encoding, errors='ignore') as info_file:
                for line in info_file:
                    if line.strip().startswith('- Country:'):
                        country = line.split(':', 1)[1].strip()
                        break

        if 'passwords.txt' in files:
            passwords_path = os.path.join(root, 'passwords.txt')
            encoding = detect_file_encoding(passwords_path)
            with open(passwords_path, 'r', encoding=encoding, errors='ignore') as pass_file:
                passwords_content = pass_file.read()
                passwords = passwords_content.split('\n')
                for password in passwords:
                    extracted_passwords.append((password, country))

    return extracted_passwords


async def main():
    print("Starting the script...")
    await client.start(phone_number)

    for channel in target_channels:
        await client(JoinChannelRequest(channel))

    try:
        today_date = datetime.now().date()

        files_dir = 'files'
        if not os.path.exists(files_dir):
            os.makedirs(files_dir)

        extract_dir = 'extracted'
        if not os.path.exists(extract_dir):
            os.makedirs(extract_dir)

        for channel in target_channels:
            full_channel = await client(GetFullChannelRequest(channel))
            total_messages = full_channel.full_chat.read_inbox_max_id

            print(f"Scraping {total_messages} messages from channel {channel}.")

            message_count = 0
            async for message in client.iter_messages(channel,
                                                      min_id=last_message_ids.get(channel, 0) + 1):
                message_count += 1
                print(
                    f"Processing message {message_count}/{total_messages} from channel {channel} (MESSAGE ID: {message.id}).")
                #if message.date.date() == today_date:
                file_path = None
                if isinstance(message.media, MessageMediaDocument):
                    if any(message.media.document.mime_type.endswith(ext) for ext in
                           ['.zip', '.rar']) or message.media.document.mime_type in ['application/zip',
                                                                                     'application/x-rar-compressed']:
                        file_extension = '.zip' if 'zip' in message.media.document.mime_type else '.rar'
                        file_path = os.path.join(files_dir, f'{message.id}{file_extension}')

                        if os.path.exists(file_path):
                            print(f"File {file_path} already exists. Skipping download.")
                        else:
                            await download_media_with_progress(message, file_path,
                                                               chunk_size=1024 * 1024)  # 1MB chunks

                        passcode = extract_pass(message.message)

                        print(f"File Password: {passcode}")
                        extracted_passwords = extract_and_find_passwords(file_path, extract_dir, passcode)
                        for password_data, country in extracted_passwords:
                            #browser = profile = url = login = password_text = None  #
                            for line in password_data.split('\n'):
                                if line.startswith('browser:') or line.startswith('Soft:'):
                                    browser = line.split(': ', 1)[1]
                                elif line.startswith('profile:') or line.startswith('Profile:'):
                                    profile = line.split(': ', 1)[1]
                                elif line.startswith('url:') or line.startswith('Host:'):
                                    url = line.split(': ', 1)[1]
                                elif line.startswith('login:') or line.startswith('Login:'):
                                    login = line.split(': ', 1)[1]
                                elif line.startswith('password:') or line.startswith('Password:'):
                                    password_text = line.split(': ', 1)[1]
                                    cursor.execute('''
                                        INSERT INTO passwords (browser, profile, url, login, password, country) VALUES (?, ?, ?, ?, ?, ?)
                                    ''', (browser, profile, url, login, password_text, country))
                                    conn.commit()

                        shutil.rmtree(extract_dir)
                        os.makedirs(extract_dir)
                    last_message_ids[channel] = max(last_message_ids.get(channel, 0), message.id)

        for channel, last_id in last_message_ids.items():
            cursor.execute('''
                INSERT INTO last_message_ids (channel, last_id) VALUES (?, ?)
                ON CONFLICT(channel) DO UPDATE SET last_id = excluded.last_id
            ''', (channel, last_id))
            conn.commit()
    except PermissionError:
        print(
            f"Permission denied: '{db_path}'. Make sure the file is not open in another program and you have the right permissions.")
    finally:
        await client.disconnect()


if __name__ == '__main__':
    asyncio.run(main())
    conn.close()
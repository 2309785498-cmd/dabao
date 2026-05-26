import paramiko

host = '124.222.15.25'
user = 'ubuntu'
password = '2309785498Li'
pubkey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQClk3NdjzRUxHJIrEchp3xB/swcxol8FKer/4J5ePLwUI7nOjx5mEFG45+q6C+NSpD5mUWUanGa3wKYJRpJHr8HOSXMIaGV+w6ZqsHHg+pvOrIIGXSCj1jsMooQf5omMSAB08WZep4zjZnyJNBrVrWdOBj6TBvBMqeomDkao5fFIBQo/a9AB7uvdKpFOK9X5ifFUGWhWkdQDIj0ho+xiv7jvNkwliv4TjAqS2KBCXG6XyZOOayKe7g8HqTjKIiwcR/90BfvkAieN6S5ZEPynD3jay3x9MDunQxhgO+bNzb8wEIX7q9qIkyVsZU2z0WtYZj5JtTeJKNjnoPP4hJKaBqn'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, look_for_keys=False, allow_agent=False)

def run(cmd, desc=''):
    print(f'>>> {desc}')
    stdin, stdout, stderr = client.exec_command(cmd)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    if exit_code != 0:
        print(f'  ERR (exit={exit_code}): {err[-300:]}')
    else:
        print(f'  OK')
    return exit_code, out, err

# Step 1: Add SSH public key
run(
    f'mkdir -p ~/.ssh && echo "{pubkey}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh',
    'Adding SSH key'
)

# Step 2: Update apt
run('sudo apt update -qq 2>&1 | tail -1', 'Updating apt')

# Step 3: Install packages
run('sudo apt install -y -qq python3 python3-venv python3-pip git nginx 2>&1 | tail -5', 'Installing packages')

# Step 4: Create project directory
run('sudo mkdir -p /home/ubuntu/quan && sudo chown -R ubuntu:ubuntu /home/ubuntu/quan', 'Creating project dir')

# Step 5: Install Python packages globally for gunicorn etc
run('sudo pip3 install gunicorn 2>&1 | tail -2', 'Installing gunicorn globally')

client.close()
print('\n=== Server initialization complete ===')

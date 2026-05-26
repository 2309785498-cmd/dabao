import paramiko

host = '124.222.15.25'
user = 'ubuntu'
password = '2309785498Li'

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
        print(f'  ERR (exit={exit_code}): {err[-500:]}')
    else:
        print(f'  OK')
    if out.strip():
        print(f'  --> {out[:300]}')
    return exit_code, out, err

# Step 1: Check current state
run('ps aux | grep -E "python|gunicorn|flask" | grep -v grep', 'Checking running processes')
run('ls -la /home/ubuntu/quan/', 'Checking project directory')

# Step 2: Create project directory structure
run('mkdir -p /home/ubuntu/quan/backend', 'Creating backend directory')

client.close()
print('\n=== Done ===')

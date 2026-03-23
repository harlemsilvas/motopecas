import requests
import getpass
import sys

API_URL = "http://localhost:5000/api/auth"
TOKEN_FILE = "token.txt"

def cadastrar_usuario(username, password):
    resp = requests.post(f"{API_URL}/register", json={"username": username, "password": password})
    if resp.status_code == 201:
        print("Usuário cadastrado com sucesso!")
    elif resp.status_code == 409:
        print("Usuário já existe. Prosseguindo para login...")
    else:
        print(f"Erro ao cadastrar: {resp.text}")
        sys.exit(1)

def fazer_login(username, password):
    resp = requests.post(f"{API_URL}/login", json={"username": username, "password": password})
    if resp.status_code == 200:
        token = resp.json().get("token")
        if token:
            with open(TOKEN_FILE, "w") as f:
                f.write(token)
            print(f"Login realizado! Token salvo em {TOKEN_FILE}")
            return token
        else:
            print("Token não recebido!")
            sys.exit(1)
    else:
        print(f"Erro ao fazer login: {resp.text}")
        sys.exit(1)

def main():
    print("Cadastro e login de usuário admin para painel protegido.")
    username = input("Usuário: ")
    password = getpass.getpass("Senha: ")
    cadastrar_usuario(username, password)
    fazer_login(username, password)

if __name__ == "__main__":
    main()

# eB-L-system
# 1
termina: lsblk (verificar o diretorio onde a PEN está mounted)

Substituir nos ficheiros:

-create_keys.py

-regente_seguradoras/.env

run:
mkdir regente_seguradoras/keys
python3 create_keys.py

# 2

dir /regente_seguradoras:

python3 -m venv venv

source venv/bin/activate 

pip install -r requirements.txt

uvicorn main:app --reload --port 8002


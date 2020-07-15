# https://realpython.com/flask-by-example-part-1-project-setup/
cd databaits/flask_server/
python3 -m venv env
source env/bin/activate
touch app.py .gitignore README.md requirements.txt
python -m pip install Flask==1.1.1
python -m pip freeze > requirements.txt
python -m pip install uWSGI==20.0.18
python -m pip freeze > requirements.txt
python app.py 
# Project README

## System Design

This document provides an overview of the system design and how to get started with the project.

## Folder Structure

The project follows a service-oriented folder structure to ensure scalability and separation of concerns. This approach promotes consistency as the project grows.

## Server

### Getting Started

1. **Install Python 3.12.4**

    Ensure you have Python 3.12.4 installed on your system.

2. **Install a Python Version Manager**

    We recommend using `pyenv` to manage your Python versions. Follow the instructions on the [pyenv GitHub repository](https://github.com/pyenv/pyenv#installation) for installation.

3. **Install Python via pyenv**

    - Check available versions of Python on your system:
      ```sh
      pyenv versions
      ```

    - Install Python 3.12.4:
      ```sh
      pyenv install 3.12.4
      ```

    - Set Python 3.12.4 as your global Python version:
      ```sh
      pyenv global 3.12.4
      ```

    - Open a new command prompt and verify the correct version is set:
      ```sh
      python -V
      ```

### Folder Architecture (Service Oriented)

We follow a service-oriented folder structure as suggested by the [fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices#1-project-structure-consistent--predictable) repository. This decision is made to ensure scalability and separation of concerns.


Certainly! Here's the improved representation of the folder architecture based on the image you provided:

markdown
Copy code
## Folder Architecture (Service Oriented)

The project follows a service-oriented folder structure to ensure scalability and separation of concerns. This approach promotes consistency as the project grows. Below is the structure of the `server` folder:

    server/
    ├────── .venv/
    ├────── api/
    │ ├──────── pycache/
    │ ├──────── auth/
    │ ├──────── dark_web/
    │ ├──────── surface_web/
    │ ├──────── users/
    │ ├──────── init.py
    │ └──────── api.py
    ├────── core/
    │ ├──────── db/
    │ ├──────── enums/
    │ ├──────── modals/
    │ ├────────schemas/
    │ └──────── Exceptions.py
    ├────── .env
    ├────── .gitignore
    ├────── docker-compose.yml
    ├────── Dockerfile.app
    ├────── main.py
    └────── requirements.txt

## Web


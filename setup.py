from setuptools import setup, find_packages

setup(
    name="shortcut-store",
    version="1.0.0",
    description="Shortcut Store - Django + React E-commerce",
    packages=find_packages(),
    install_requires=[
        "Django>=5.2.1",
        "djangorestframework>=3.16.0",
        "django-cors-headers>=4.3.0",
        "gunicorn>=21.2.0",
        "whitenoise>=6.6.0",
        "PyMySQL>=1.1.0",
        "requests>=2.31.0",
    ],
    python_requires=">=3.9",
) 
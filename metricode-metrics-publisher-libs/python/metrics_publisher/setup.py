from setuptools import setup, find_packages

setup(
    name="metrics_uploader",
    version="1.0.0",
    description="Biblioteka do wysyłania wyników benchmarków do centralnego API",
    author="Your Name",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0"
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License"
    ],
)
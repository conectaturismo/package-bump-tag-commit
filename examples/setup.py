from setuptools import setup, find_packages

setup(
    name="example-python-package",
    version="1.0.0",
    author="Example Author",
    author_email="author@example.com",
    description="Example Python package",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.25.1",
    ],
)
# Example GitHub Actions Workflows

## PHP Project (Composer)

```yaml
name: PHP Version Bump
on:
  push:
    branches: [ main ]
    
jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Bump PHP version
        id: bump
        uses: conectaturismo/package-bump-tag-commit@v1.2.0
        with:
          lang: 'php'
          path: './composer.json'
          bumpLvl: 'patch'
          save: true
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Output new version
        run: echo "New version is ${{ steps.bump.outputs.version }}"
```

## Python Project (pyproject.toml)

```yaml
name: Python Version Bump
on:
  workflow_dispatch:
    inputs:
      bump_level:
        description: 'Bump level'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor  
          - major
          - hotfix
          
jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Bump Python version
        id: bump
        uses: conectaturismo/package-bump-tag-commit@v1.2.0
        with:
          lang: 'python'
          path: './pyproject.toml'
          bumpLvl: ${{ github.event.inputs.bump_level }}
          save: true
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ steps.bump.outputs.version }}
          release_name: Release v${{ steps.bump.outputs.version }}
          draft: false
          prerelease: false
```

## Python Project (setup.py)

```yaml
name: Python Legacy Version Bump
on:
  release:
    types: [published]
    
jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Bump version in setup.py
        id: bump
        uses: conectaturismo/package-bump-tag-commit@v1.2.0
        with:
          lang: 'python'
          path: './setup.py'
          bumpLvl: 'patch'
          save: true
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Multi-language Project

```yaml
name: Multi-language Version Sync
on:
  workflow_dispatch:
    
jobs:
  sync-versions:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - lang: js
            path: ./package.json
          - lang: php  
            path: ./composer.json
          - lang: python
            path: ./pyproject.toml
            
    steps:
      - uses: actions/checkout@v4
      
      - name: Bump ${{ matrix.lang }} version
        id: bump
        uses: conectaturismo/package-bump-tag-commit@v1.2.0
        with:
          lang: ${{ matrix.lang }}
          path: ${{ matrix.path }}
          bumpLvl: 'patch'
          save: true
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Output version
        run: echo "${{ matrix.lang }} version: ${{ steps.bump.outputs.version }}"
```

## Python Auto-detection

```yaml
name: Python Auto-detect Version Bump
on:
  push:
    tags:
      - 'v*'
    
jobs:
  bump-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # No need to specify path - will auto-detect pyproject.toml, setup.py, or __init__.py
      - name: Bump Python version (auto-detect)
        id: bump
        uses: conectaturismo/package-bump-tag-commit@v1.2.0
        with:
          lang: 'python'
          bumpLvl: 'minor'
          save: true
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```
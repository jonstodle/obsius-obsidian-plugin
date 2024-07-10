#!/usr/bin/env just --justfile
export PATH := "./node_modules/.bin:" + env_var('PATH')

dev:
	npm run dev

build:
	npm run build

version version:
	pnpm version {{version}}
	npm run version

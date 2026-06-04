# ─── AQLIYA Terraform Makefile ───
# Convenience commands for all environments.
#
# Usage:
#   make init env=dev
#   make plan env=dev
#   make apply env=dev
#   make validate
#   make fmt

ENV ?= dev
TF := terraform
TF_DIR := environments/$(ENV)
BACKEND := environments/$(ENV)/backend.tf
TFVARS := environments/$(ENV)/terraform.tfvars

.PHONY: init plan apply destroy validate fmt fmt-check bootstrap

init:
	$(TF) init -backend-config=$(BACKEND) -reconfigure

plan:
	$(TF) plan -var-file=$(TFVARS) -out=tfplan

apply:
	$(TF) apply tfplan

destroy:
	$(TF) plan -var-file=$(TFVARS) -destroy -out=tfplan-destroy
	$(TF) apply tfplan-destroy

validate:
	$(TF) fmt -check -recursive
	$(TF) validate

fmt:
	$(TF) fmt -recursive

fmt-check:
	$(TF) fmt -check -recursive

output:
	$(TF) output

console:
	$(TF) console

bootstrap:
	@echo "Run: ./bootstrap.sh"
	@echo "This creates the S3 backend bucket + DynamoDB lock table."
	@echo "Must be done once per AWS account."

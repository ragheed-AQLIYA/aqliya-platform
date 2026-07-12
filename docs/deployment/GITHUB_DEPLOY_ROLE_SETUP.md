# GitHub Deploy Role Setup

**Status:** Action Required | **Priority:** Medium

---

## What is Needed

The CI/CD pipeline (`.github/workflows/deploy.yml`) expects an IAM role for GitHub OIDC authentication via `AWS_DEPLOY_ROLE_ARN`.

## IAM Role Configuration

```bash
# Create OIDC provider for GitHub
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com

# Create deployment role with trust policy
aws iam create-role \
  --role-name aqliya-github-deploy \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::308621094029:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:sub": "repo:<org>/<repo>:ref:refs/heads/main"
          }
        }
      }
    ]
  }'

# Attach required policies
aws iam attach-role-policy \
  --role-name aqliya-github-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

aws iam attach-role-policy \
  --role-name aqliya-github-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
```

## GitHub Secret

Set `AWS_DEPLOY_ROLE_ARN` in GitHub repository secrets to the created role's ARN.

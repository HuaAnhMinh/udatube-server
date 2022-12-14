const LogRole = [{
  Action: [
    "logs:CreateLogStream",
    "logs:CreateLogGroup"
  ],
  Resource: [
    "arn:aws:logs:${self:provider.region}:${aws:accountId}:log-group:/aws/lambda/udatube-*:*"
  ],
  Effect: "Allow"
}, {
  Action: [
    "logs:PutLogEvents"
  ],
  Resource: [
    "arn:aws:logs:${self:provider.region}:${aws:accountId}:log-group:/aws/lambda/udatube-*:*:*"
  ],
  Effect: "Allow"
}];

export default LogRole;
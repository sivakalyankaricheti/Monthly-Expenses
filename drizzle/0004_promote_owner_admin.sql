UPDATE `users`
SET `role` = 'admin', `status` = 'active'
WHERE lower(`email`) = 'kalyankaricheti@gmail.com';

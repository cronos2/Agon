Vagrant.configure('2') do |config|
  config.vm.box = 'azure'
  config.vm.synced_folder '.', '/vagrant', disabled: true

  # use local ssh key to connect to remote vagrant box
  config.ssh.private_key_path = '~/.ssh/id_rsa'
  config.vm.provider :azure do |azure, override|

    # each of the below values will default to use the env vars named as below if not specified explicitly
    azure.tenant_id = ENV['AZURE_TENANT_ID']
    azure.client_id = ENV['AZURE_CLIENT_ID']
    azure.client_secret = ENV['AZURE_CLIENT_SECRET']
    azure.subscription_id = ENV['AZURE_SUBSCRIPTION_ID']

    azure.vm_name = 'agonvm'
    azure.dns_name = ENV['DEPLOY_HOST'].split('.')[0]
    azure.vm_image_urn = 'credativ:Debian:8:latest'
    azure.vm_storage_account_type = 'Standard_LRS'
    azure.tcp_endpoints = 80
    azure.resource_group_name = 'agonrg'
    azure.location = 'westeurope'
  end

  config.vm.provision 'ansible' do |ansible|
    ansible.playbook = 'provision/node.yml'
  end

end

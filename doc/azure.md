# Deploying the application in Azure

## Configuring Vagrant

We use a Vagrantfile to simplify the interaction with the virtual machines we will need to create. The [`vagrant-azure`](https://github.com/Azure/vagrant-azure) is needed too in order to allow Vagrant to communicate with the Azure API to manage the VMs. This communication will be handled through a service principal which we will need to create in advance.

The Vagrantfile requires some values to be specified, such as the service principal's tenant's ID, its id and the password/secret. We can also specify the name of the VM, the subdomain in which the VM will be listening, the image from which to build the VM, etc.

Finally, we must tell Vagrant about the provisioning. For this task we will be using Ansible playbooks.

## Configuring Ansible

Our only real _system-wise_ dependencies are `rsync` for the transference of files, `npm` for the installation of packages and `node` for the actual execution of the application, so this is what we include in the playbook declaration.

## Deploying a release

While Capistrano is a more than viable option, having already included Vagrant and Ansible as _dependencies_ made us feel like a JavaScript community would be better suited. This is why Shipit has been chosen, since we can explicitly set that dependency via the package.json.

For the deployment, besides copying the project skeleton to the target machine, we need to install the application dependencies there, set up some environment variables and start the server. Actually, all this only happens if the tests we have defined pass, trying to avoid any avoidable human errors.

## TL;DR

In order the deploy the application, you will first need to get somewhere to host it. In order to do that, you can use

``` shell
vagrant up --provider=azure
```

Once the server is provisioned, to actually deploy the application and start running it just execute

``` shell
npx shipit production deploy --shipitfile deployment/shipitfile.js
```

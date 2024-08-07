 


SELECT a.id, a.name, a.price, a.amount FROM ConfigurationAccessory ac JOIN Accessory a ON ac.accessoryId = a.id WHERE ac.configurationId = 1;
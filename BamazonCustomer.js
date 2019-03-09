var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var figlet = require('figlet');
 
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});

figlet('Welcome To Bamazon', function(err, data) {
    if (err) {
        console.log('Error!');
        console.dir(err);
        return;
    }
    console.log(' ')
    console.log(data)
    console.log(' ')
});

connection.connect(function (err) {
    if (err) throw err;

    inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: 'Select from List',
        choices: ['View inventory', 'Place an order']

    }]).then(answers => {
        JSON.stringify(answers, null, ' ');
        console.log(answers.choice);
        if (answers.choice == 'View inventory') {
            printInv()
        } else if (answers.choice == 'Place an order') {
            inquirer.prompt([{
                type: 'input',
                name: 'item_id',
                message: 'Select item_id to order',
            },
            {
                type: 'input',
                name: 'stock_quantity',
                message: 'Select total quantity'
            }]).then(answers => {
                var requestedQty = answers.stock_quantity;
                var requestedItemId = answers.item_id;

                function getStockQtyTotal(callback) {
                    var query = 'select * from products where ?';
                    var data = {
                        item_id: answers.item_id
                    }
                    connection.query(query, data, function (err, res) {
                        if (err) throw err;
                        var actualInvQty = res[0].stock_quantity;
                        var price = res[0].price;
                        callback(actualInvQty, price);
                    });
                }
                getStockQtyTotal(function (returnedData, returnedtotal) {
                    if (returnedData < requestedQty) {
                        console.log("Not enough product in stock to place order");
                        console.log('Order quantity should be ' +returnedData+ ' or less');
                    } else {
                        var UpdatedInvTotal = returnedData - requestedQty;
                        var total = requestedQty * returnedtotal;
                        console.log('--------Order Summary-----------')
                        console.log('Total Before Tax $'+total);
                        connection.query('update products set ? where ?', [{
                            stock_quantity: UpdatedInvTotal
                        },
                        {
                            item_id: requestedItemId
                        }],
                            function (err, res) {
                                if (err) {
                                    throw err;
                                }
                            });
                        printInv();
                    }
                });

            });
        }
    });

});
function printInv() {
    connection.query('select * from bamazon.products', function (err, res) {
        if (err) throw err;
        console.log('-------Stock Reamining--------');
        console.log('');
        console.table(res);
    });
}
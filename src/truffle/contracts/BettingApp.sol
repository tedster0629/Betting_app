pragma solidity >= 0.5.0 < 0.6.0;

contract BettingApp {
    address payable public contractOwner;
    uint public unusedAddressId;
    uint public availableAddresses;
    uint public newAddressId;
    uint public totalBetAmount;
    uint public totalBetUpAmount;
    uint public totalBetDownAmount;

    constructor() public {
        contractOwner = msg.sender;
        availableAddresses = 0;
        unusedAddressId = 0;
        newAddressId = 0;
        totalBetAmount = 0;
        totalBetUpAmount = 0;
        totalBetDownAmount = 0;
    }
    
    struct User {
        string password;
        address assignedAddress;
        string addressPassword;
        bool exist;
    }
    mapping (string => User) users;
    
    struct AddressesPool {
        address addressToAsign;
        string password;
    }
    mapping (uint => AddressesPool) addresses;
    
    function registerUser(string memory _username, string memory _password) public returns (bool) {
        if (msg.sender != contractOwner) return false;
        users[_username].password = _password;
        users[_username].assignedAddress = addresses[unusedAddressId].addressToAsign;
        users[_username].addressPassword = addresses[unusedAddressId].password;
        users[_username].exist = true;
        unusedAddressId++;
        availableAddresses--;
        return true;
    }

    function checkIfUserExist(string memory _username) public view returns (bool) {
        return users[_username].exist;
    }

    function logIn(string memory _username, string memory _password) public view returns (bool) {
        bytes memory tempPass = abi.encode(users[_username].password);
        bytes memory _tempPass = abi.encode(_password);
        if (users[_username].exist && keccak256(tempPass) == keccak256(_tempPass)) {
            return true;
        } else {
            return false;
        }
    }

    function getUserLoggedInAddress(string memory _username, string memory _password) public view returns(address) {
        bytes memory tempPass = abi.encode(users[_username].password);
        bytes memory _tempPass = abi.encode(_password);
        if (users[_username].exist && keccak256(tempPass) == keccak256(_tempPass)) {
            return users[_username].assignedAddress;
        }
    }
    
    function createNewAddress(address _addressToAsign, string memory _password) public returns (bool){
        if (msg.sender != contractOwner) return false;
        addresses[newAddressId].addressToAsign = _addressToAsign;
        addresses[newAddressId].password = _password;
        newAddressId++;
        availableAddresses++;
        return true;
    }

    function getAddressPass(address _address) public view returns (string memory password) {
        require(msg.sender == contractOwner);
        for (uint i = 0; i < unusedAddressId; i++) {
            if (addresses[i].addressToAsign == _address) {
                return addresses[i].password;
            }
        }
    }

    function getAvailableAddresses() public view returns (uint number) {
        return availableAddresses;
    }
    
    struct Bet {
        address payable playerAddress;
        uint8 betType;
        uint amount;
    }
    
    Bet[] public Bets;
    
    function purchaseBet(uint8 _type) public payable {
        require(msg.sender != contractOwner);
        require(_type == 1 || _type == 2);
        require(msg.value <= msg.sender.balance);
        
        Bet memory newBet;
        newBet.playerAddress = msg.sender;
        newBet.betType = _type;
        newBet.amount = msg.value;
        
        totalBetAmount += msg.value;
        
        if (_type == 1)
            totalBetDownAmount += msg.value;
        else
            totalBetUpAmount += msg.value;

        Bets.push(newBet);
    }
    
    function payWinnigBets(uint8 _winningType) public {
        require(_winningType == 1 || _winningType == 2);
        if (Bets.length > 0) {
            uint reward;
            uint rewardCoefficient;
            uint ethForHouse;
            
            if (_winningType == 1) {
                ethForHouse = totalBetUpAmount * 10 / 100;
                contractOwner.transfer(ethForHouse);
                totalBetAmount -= ethForHouse;
                rewardCoefficient = totalBetAmount * 10000 / totalBetDownAmount;
            } else {
                ethForHouse = totalBetDownAmount * 10 / 100;
                contractOwner.transfer(ethForHouse);
                totalBetAmount -= ethForHouse;
                rewardCoefficient = totalBetAmount * 10000 / totalBetUpAmount;
            }
    
            for (uint i = 0; i < Bets.length; i++) {
                if(Bets[i].betType == _winningType) {
                    reward = Bets[i].amount * rewardCoefficient / 10000;
                    Bets[i].playerAddress.transfer(reward);
                }
            }
            
            Bets.length = 0;
            totalBetAmount = 0;
            totalBetUpAmount = 0;
            totalBetDownAmount = 0;
        }
    }
}
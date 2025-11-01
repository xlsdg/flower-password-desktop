# Password Generation - Tauri Migration

## ADDED Requirements

### Requirement: Native Rust Password Generation

The system SHALL generate passwords using a native Rust implementation of the flowerpassword.js algorithm (MD5-based) invoked via Tauri command system.

#### Scenario: Password generation with valid inputs

- **WHEN** frontend invokes `generate_password` with memory password and distinguishing code
- **THEN** Rust backend executes native MD5-based algorithm and returns generated password
- **AND** password matches output from original JavaScript implementation byte-for-byte

#### Scenario: Algorithm compatibility verification

- **WHEN** comparing outputs from Rust implementation and JavaScript version with identical inputs
- **THEN** both implementations produce byte-for-byte identical passwords
- **AND** at least 100 test cases verify compatibility across various password and key combinations

### Requirement: Tauri Command Interface

The system SHALL expose password generation functionality via Tauri IPC commands.

#### Scenario: Frontend invokes password generation

- **WHEN** React component calls `invoke('generate_password', { memory, distinguishing })`
- **THEN** Tauri runtime routes command to Rust handler
- **AND** handler returns generated password as string
- **AND** frontend receives result asynchronously

#### Scenario: Error handling for invalid inputs

- **WHEN** memory password or distinguishing code is empty
- **THEN** Tauri command returns error with descriptive message
- **AND** frontend displays error to user

### Requirement: Performance Parity

The system SHALL generate passwords with performance equal to or better than Electron implementation.

#### Scenario: Password generation speed

- **WHEN** generating password via native Rust implementation
- **THEN** operation completes in under 50ms
- **AND** performance is equal to or better than Node.js flowerpassword.js execution

#### Scenario: Memory efficiency

- **WHEN** generating multiple passwords in sequence
- **THEN** memory usage remains stable
- **AND** no memory leaks occur in Rust implementation

### Requirement: Algorithm Implementation Fidelity

The system SHALL implement the flowerpassword.js algorithm with exact fidelity to the original specification.

#### Scenario: MD5 hashing sequence

- **WHEN** generating password with inputs (password="test", key="example", length=16)
- **THEN** base hash is MD5(password + key)
- **AND** rule hash is MD5(base_hash + "kise")
- **AND** source hash is MD5(base_hash + "snow")

#### Scenario: Character transformation rules

- **WHEN** applying transformation to source hash using rule hash
- **THEN** for each character position i in source hash (0-31):
  - **IF** character is a letter (a-f) AND rule_hash[i] exists in magic string "sunlovesnow1990090127xykab"
  - **THEN** convert character to uppercase
  - **ELSE** keep character unchanged

#### Scenario: First character enforcement

- **WHEN** formatting final password output
- **THEN** if first character is a digit (0-9), replace with 'K'
- **AND** if first character is a letter, keep unchanged
- **AND** ensure first character is always a letter

#### Scenario: Length validation

- **WHEN** length parameter is provided
- **THEN** length must be integer between 2 and 32 (inclusive)
- **AND** output password is truncated to specified length
- **AND** invalid length returns error

# Celestial Search Filter Specification

## Purpose
Предоставляет интерфейс поиска и фильтрации небесных тел по названию с поддержкой мгновенной выдачи, автофокусировки и бесшовной интеграции с 3D-симуляцией.

## Requirements

### Requirement: Case-insensitive search filtering
The system SHALL filter the list of celestial bodies in real time based on user input, matching against both Russian and English names without case sensitivity.

#### Scenario: Substring match in Russian
- **WHEN** user enters "марс" or "МАРС" in the search input
- **THEN** the filtered list displays Mars as a matched celestial body

#### Scenario: Substring match in English
- **WHEN** user enters "jup" in the search input
- **THEN** the filtered list displays Jupiter as a matched celestial body

#### Scenario: Empty search query
- **WHEN** the search input is empty or cleared
- **THEN** the system displays all available celestial bodies without filtering

#### Scenario: No matching results
- **WHEN** user enters a query that matches no celestial bodies
- **THEN** the system displays an empty state indicator notifying that no objects were found

### Requirement: Selection and autofocus on Enter
The system SHALL select and focus the top matching celestial body when the user presses the Enter key in the search input field.

#### Scenario: Pressing Enter with search matches
- **WHEN** user types a query matching at least one celestial body and presses Enter
- **THEN** the system focuses the camera on the first matched body and opens its detail card

#### Scenario: Pressing Enter with no matches
- **WHEN** user presses Enter while the filtered results list is empty
- **THEN** the system does not change the currently selected body or camera target

### Requirement: Preserving simulation state during search
The system SHALL preserve orbital animation, planetary rotation, and time control settings while the user searches or filters celestial bodies.

#### Scenario: Searching while simulation is playing
- **WHEN** user types or navigates search results while simulation is running at any speed
- **THEN** the 3D scene continues orbital motion and time controls remain fully responsive

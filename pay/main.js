document.getElementById('salary-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const annualSalary = parseFloat(document.getElementById('annual-salary').value);
    const payFrequency = document.getElementById('pay-frequency').value;
    const includesSuper = document.getElementById('includes-super').checked;

    const isSingle = true; // True if single, false if in a family
    const hasPrivateHealthInsurance = false;

    const superannuationRate = 0.115; // 11.5%
    const medicareRate = 0.02; // 2%
    const incomeTaxBrackets = [
        { threshold: 18200, rate: 0, baseTax: 0 },
        { threshold: 45000, rate: 0.19, baseTax: 5092 },
        { threshold: 135000, rate: 0.30, baseTax: 4288 },
        { threshold: 190000, rate: 0.37, baseTax: 31288 },
        { threshold: Infinity, rate: 0.45, baseTax: 51637 }
    ];

    let baseSalary, superannuation;

    if (includesSuper) {
        // Calculate Base Salary if super is included in annual salary
        baseSalary = annualSalary / (1 + superannuationRate);
    } else {
        baseSalary = annualSalary;
    }

    // Calculate Superannuation
    superannuation = includesSuper ?
        annualSalary - (annualSalary*superannuationRate) :
        annualSalary * superannuationRate;

    // Calculate Taxable Income
    const taxableIncome = baseSalary;


    function calculateLITO(taxableIncome) {
        let lito = 0;

        // Maximum LITO for income up to $37,500
        if (taxableIncome <= 37500) {
            lito = 700; // Maximum offset
        }
        // Gradual reduction for incomes between $37,501 and $45,000
        else if (taxableIncome > 37500 && taxableIncome <= 45000) {
            lito = 700 - ((taxableIncome - 37500) * 0.05); // Reduces by 5 cents for every dollar over $37,500
        }
        // Further reduction for incomes between $45,001 and $66,667
        else if (taxableIncome > 45000 && taxableIncome <= 66667) {
            lito = 325 - ((taxableIncome - 45000) * 0.015); // Reduces by 1.5% for every dollar over $45,000
        }
        // No LITO for incomes above $66,667
        else {
            lito = 0; // No offset applicable
        }

        // Ensure LITO does not go below zero
        return Math.max(lito, 0);
    }

    function calculateMedicareLevy(taxableIncome, isSingle, hasPrivateHealthInsurance) {
        const medicareLevyRate = 0.02; // 2%
        const incomeThresholdSingle = 90000; // Threshold for MLS
        const incomeThresholdHighSingle = 105000; // High-income threshold
        const incomeThresholdFamily = 180000; // Base threshold for families

        let medicareLevy = taxableIncome * medicareLevyRate;

        // Check if the individual is single and above the income threshold
        if (isSingle) {
            if (taxableIncome > incomeThresholdHighSingle) {
                // 1.5% surcharge for income over $105,000
                medicareLevy += taxableIncome * 0.015; // 1.5% surcharge
            } else if (taxableIncome > incomeThresholdSingle) {
                // 1% surcharge for income over $90,000
                medicareLevy += taxableIncome * 0.01; // 1% surcharge
            }
        } else {
            // For families, you can implement similar logic based on combined income
            // Here we assume `taxableIncome` is the family's combined income
            if (taxableIncome > incomeThresholdFamily) {
                medicareLevy += (taxableIncome - incomeThresholdFamily) * 0.01; // Adjust based on income
            }
        }

        // Adjust for individuals with private health insurance
        if (hasPrivateHealthInsurance) {
            medicareLevy = Math.max(0, medicareLevy - (taxableIncome * 0.02)); // Potential reduction
        }

        return medicareLevy;
    }

    function findTaxBracketIndex(taxableIncome) {
        // If income is greater than 190000, return the last index (index 4)
        if (taxableIncome > incomeTaxBrackets[3].threshold) {
            return {
                index: 4,
                bracket: incomeTaxBrackets[4]
            };
        }

        // Iterate through the brackets to find the appropriate index
        for (let i = 0; i < incomeTaxBrackets.length; i++) {
            // If income matches the current threshold
            if (taxableIncome === incomeTaxBrackets[i].threshold) {
                return {
                    index: i,
                    bracket: incomeTaxBrackets[i]
                };
            }

            // If income is less than the current threshold, return the previous index
            if (taxableIncome < incomeTaxBrackets[i].threshold) {
                return {
                    index: i,
                    bracket: incomeTaxBrackets[i]
                };
            }
        }

        // In case taxableIncome is less than the first threshold (not typical for valid income)
        return {
            index: 0,
            bracket: incomeTaxBrackets[0]
        };
    }



    const taxRate = findTaxBracketIndex(taxableIncome);

    const threshold = incomeTaxBrackets[taxRate.index -1].threshold;
    // Calculate Total Income Tax
    let totalIncomeTax = taxRate.bracket.baseTax + (taxableIncome - threshold)*taxRate.bracket.rate ;


    // Calculate Medicare Levy
    const medicareLevy = calculateMedicareLevy(taxableIncome, true, false);

    // Division 293 Tax (additional tax on super)
    const division293Tax = taxableIncome > 250000 ? superannuation * 0.15 : 0;

    const lowIncomeTaxOffset  = calculateLITO(taxableIncome);
    // Total Tax Payable
    const totalTaxPayable = totalIncomeTax + medicareLevy + division293Tax - lowIncomeTaxOffset;

    // Calculate Salary Per Pay Period
    let salaryPerPeriod;
    let frequencyMultiplier;
    switch (payFrequency) {
        case 'monthly':
            salaryPerPeriod = (taxableIncome / 12).toFixed(2);
            frequencyMultiplier=12;
            break;
        case 'fortnightly':
            salaryPerPeriod = (taxableIncome / 26).toFixed(2);
            frequencyMultiplier=26;
            break;
        case 'weekly':
            salaryPerPeriod = (taxableIncome / 52).toFixed(2);
            frequencyMultiplier=52;
            break;
        case 'annually':
            salaryPerPeriod = annualSalary.toFixed(2); // Directly use the annual salary
            frequencyMultiplier=1;
            break;
        default:
            salaryPerPeriod = (taxableIncome / 1).toFixed(2);
    }

    const netSalaryAfterTax = (salaryPerPeriod - (totalTaxPayable / frequencyMultiplier)).toFixed(2);

    function formatNumberWithCommas(num) {
        return '$ '+Number(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    // Display Results
    const resultHTML = `
        <h2>Summary</h2>
        <table>
            <tr>
                <th>Details</th>
                <th>${payFrequency.charAt(0).toUpperCase() + payFrequency.slice(1)}</th>
            </tr>
           
            <tr>
                <td>Base Salary</td>
                <td class="dollar">${formatNumberWithCommas(baseSalary)} </td>
            </tr>
            <tr>
                <td>Superannuation</td>
                <td class="dollar">${formatNumberWithCommas(superannuation)}</td>
            </tr>
            <tr>
                <td>Taxable Income</td>
                <td class="dollar">${formatNumberWithCommas(taxableIncome)}</td>
            </tr>
            <tr>
                <td>Total Income Tax</td>
                <td class="dollar">${formatNumberWithCommas(totalIncomeTax)}</td>
            </tr>
            <tr>
                <td>Medicare Levy</td>
                <td class="dollar">${formatNumberWithCommas(medicareLevy)}</td>
            </tr>
            
            ${division293Tax > 0 ?
            `<tr>
                <td>Division 293 Tax</td>
                <td class="dollar">${formatNumberWithCommas(division293Tax)}</td>
            </tr>`
            :''
            }
            
            ${lowIncomeTaxOffset > 0 ?
            `<tr>
                    <td>Low Income Tax Offset</td>
                    <td class="dollar"> -${formatNumberWithCommas(lowIncomeTaxOffset)}</td>
                </tr>`
            :''
            }
            
            <tr>
                <td>Total Tax Payable</td>
                <td class="dollar">${formatNumberWithCommas(totalTaxPayable)}</td>
            </tr>
            <tr class="net-salary">
                <td>Salary After Tax</td>
                <td class="dollar">${formatNumberWithCommas(netSalaryAfterTax)}</td>
            </tr>
        </table>
    `;

    document.getElementById('result').innerHTML = resultHTML;
});

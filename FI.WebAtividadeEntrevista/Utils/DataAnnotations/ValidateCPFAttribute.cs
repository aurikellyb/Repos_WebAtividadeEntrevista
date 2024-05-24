using System.ComponentModel.DataAnnotations;

public class ValidateCPFAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var cpf = value as string;

        cpf = cpf.Replace(".", "").Replace("-", "");

        if (cpf.Length != 11)
            return new ValidationResult("O CPF deve ter 11 dígitos.");

        if (new string(cpf[0], cpf.Length) == cpf)
            return new ValidationResult("CPF inválido.");

        if (!IsValidCPF(cpf))
            return new ValidationResult("CPF inválido.");

        return ValidationResult.Success;
    }

    private bool IsValidCPF(string cpf)
    {
        int[] multiplicadoresPrimeiroDigito = { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
        int[] multiplicadoresSegundoDigito = { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

        string cpfSemDigitos = cpf.Substring(0, 9);
        string digitoVerificador = cpf.Substring(9, 2);

        int primeiroDigitoVerificador = CalcularDigitoVerificador(cpfSemDigitos, multiplicadoresPrimeiroDigito);

        if (primeiroDigitoVerificador != int.Parse(digitoVerificador[0].ToString()))
            return false;

        cpfSemDigitos += primeiroDigitoVerificador;

        int segundoDigitoVerificador = CalcularDigitoVerificador(cpfSemDigitos, multiplicadoresSegundoDigito);

        if (segundoDigitoVerificador != int.Parse(digitoVerificador[1].ToString()))
            return false;

        return true;
    }

    private int CalcularDigitoVerificador(string cpf, int[] multiplicadores)
    {
        int soma = 0;

        for (int i = 0; i < multiplicadores.Length; i++)
            soma += int.Parse(cpf[i].ToString()) * multiplicadores[i];

        int resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }
}

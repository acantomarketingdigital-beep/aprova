import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/users.entity';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * POST /api/v1/employees/import-payroll
   *
   * Accepts multipart/form-data with:
   *   - file: CSV file (required)
   *   - company_id: UUID (required — TODO: extract from JWT instead)
   *
   * CSV columns required:
   *   Nome, CPF, Departamento, Salario Liquido, Data de Admissao (DD/MM/AAAA)
   */
  @Post('import-payroll')
  @Roles(UserRole.RH_ADMIN, UserRole.MASTER_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async importPayroll(
    @UploadedFile() file: Express.Multer.File,
    @Body('company_id') companyId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado. Inclua o campo "file" no multipart.');
    }

    const allowedMime = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    if (!allowedMime.some((m) => file.mimetype.startsWith(m))) {
      // Be lenient with browser MIME type differences on CSV
      if (!file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
        throw new BadRequestException('Formato inválido. Envie um arquivo CSV, XLSX ou XLS.');
      }
    }

    // TODO: extract companyId from JWT (@CurrentUser()) instead of body param
    if (!companyId) {
      throw new BadRequestException('company_id obrigatório no corpo da requisição.');
    }

    return this.employeesService.importPayroll(file.buffer, companyId);
  }

  /**
   * POST /api/v1/employees/recalculate-risk
   *
   * Triggers a full risk-tier recalculation for all active employees of a company.
   * Useful to run daily via cron — TODO: wire to a cron job.
   */
  @Post('recalculate-risk')
  @Roles(UserRole.RH_ADMIN, UserRole.MASTER_ADMIN)
  async recalculateRisk(@Body('company_id') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('company_id obrigatório.');
    }
    const count = await this.employeesService.recalculateAllRiskTiers(companyId);
    return { recalculated: count, message: `${count} colaboradores recalculados.` };
  }

  @Get(':id')
  @Roles(UserRole.RH_ADMIN, UserRole.MASTER_ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const emp = await this.employeesService.findById(id);
    if (!emp) throw new BadRequestException('Colaborador não encontrado.');
    return emp;
  }
}
